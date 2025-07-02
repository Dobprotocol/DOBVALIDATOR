const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function generatePostmanCollection() {
  console.log('🔍 Fetching all profiles from database...');
  
  try {
    // Get all profiles with user information
    const profiles = await prisma.profile.findMany({
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            email: true,
            name: true,
            company: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Found ${profiles.length} profiles in database`);
    
    // Create Postman collection
    const collection = {
      info: {
        name: "DOB Validator - All Profiles",
        description: "Collection containing all profile entries from the database",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: []
    };
    
    // Add a summary request
    collection.item.push({
      name: "📊 Profile Summary",
      request: {
        method: "GET",
        header: [],
        url: {
          raw: "{{baseUrl}}/api/profile-summary",
          host: ["{{baseUrl}}"],
          path: ["api", "profile-summary"]
        },
        description: "Summary of all profiles in the database"
      },
      response: [
        {
          name: "Profile Summary Response",
          originalRequest: {
            method: "GET",
            header: [],
            url: {
              raw: "{{baseUrl}}/api/profile-summary",
              host: ["{{baseUrl}}"],
              path: ["api", "profile-summary"]
            }
          },
          status: "OK",
          code: 200,
          _postman_previewlanguage: "json",
          header: [
            {
              key: "Content-Type",
              value: "application/json"
            }
          ],
          cookie: [],
          body: JSON.stringify({
            success: true,
            totalProfiles: profiles.length,
            summary: {
              roles: profiles.reduce((acc, p) => {
                acc[p.user.role] = (acc[p.user.role] || 0) + 1;
                return acc;
              }, {}),
              companies: profiles.reduce((acc, p) => {
                const company = p.company || 'No Company';
                acc[company] = (acc[company] || 0) + 1;
                return acc;
              }, {}),
              profilesWithCompany: profiles.filter(p => p.company && p.company.trim() !== '').length
            }
          }, null, 2)
        }
      ]
    });
    
    // Add individual profile requests
    profiles.forEach((profile, index) => {
      const requestName = `${index + 1}. ${profile.name} (${profile.walletAddress})`;
      
      collection.item.push({
        name: requestName,
        request: {
          method: "GET",
          header: [
            {
              key: "Authorization",
              value: "Bearer {{token}}",
              description: "JWT token for authentication"
            }
          ],
          url: {
            raw: "{{baseUrl}}/api/profile",
            host: ["{{baseUrl}}"],
            path: ["api", "profile"]
          },
          description: `Profile for ${profile.name}\n\n**Database Info:**\n- Profile ID: ${profile.id}\n- User ID: ${profile.userId}\n- User Role: ${profile.user.role}\n- Email: ${profile.email}\n- Company: ${profile.company || 'N/A'}\n- Created: ${profile.createdAt.toISOString()}\n- Updated: ${profile.updatedAt.toISOString()}`
        },
        response: [
          {
            name: "Profile Response",
            originalRequest: {
              method: "GET",
              header: [
                {
                  key: "Authorization",
                  value: "Bearer {{token}}"
                }
              ],
              url: {
                raw: "{{baseUrl}}/api/profile",
                host: ["{{baseUrl}}"],
                path: ["api", "profile"]
              }
            },
            status: "OK",
            code: 200,
            _postman_previewlanguage: "json",
            header: [
              {
                key: "Content-Type",
                value: "application/json"
              }
            ],
            cookie: [],
            body: JSON.stringify({
              success: true,
              profile: {
                id: profile.id,
                userId: profile.userId,
                name: profile.name,
                company: profile.company,
                email: profile.email,
                walletAddress: profile.walletAddress,
                createdAt: profile.createdAt.toISOString(),
                updatedAt: profile.updatedAt.toISOString()
              }
            }, null, 2)
          }
        ]
      });
    });
    
    // Add environment variables
    const environment = {
      id: "dob-validator-profiles-env",
      name: "DOB Validator Profiles Environment",
      values: [
        {
          key: "baseUrl",
          value: "https://v.dobprotocol.com",
          type: "default",
          enabled: true
        },
        {
          key: "token",
          value: "YOUR_JWT_TOKEN_HERE",
          type: "secret",
          enabled: true
        }
      ]
    };
    
    // Write collection to file
    const collectionPath = './dob-validator-profiles-collection.json';
    fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
    
    // Write environment to file
    const environmentPath = './dob-validator-profiles-environment.json';
    fs.writeFileSync(environmentPath, JSON.stringify(environment, null, 2));
    
    console.log('\n✅ Postman files generated successfully!');
    console.log(`📁 Collection: ${collectionPath}`);
    console.log(`📁 Environment: ${environmentPath}`);
    console.log(`\n📋 How to use:`);
    console.log(`1. Open Postman`);
    console.log(`2. Import the collection file: ${collectionPath}`);
    console.log(`3. Import the environment file: ${environmentPath}`);
    console.log(`4. Set the environment in Postman`);
    console.log(`5. Update the 'token' variable with a valid JWT token`);
    console.log(`6. Run the requests!`);
    
    // Also create a simple JSON file with all profile data
    const profilesData = {
      totalProfiles: profiles.length,
      profiles: profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        company: profile.company,
        walletAddress: profile.walletAddress,
        userRole: profile.user.role,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString()
      }))
    };
    
    const profilesPath = './all-profiles-data.json';
    fs.writeFileSync(profilesPath, JSON.stringify(profilesData, null, 2));
    console.log(`📁 Raw Data: ${profilesPath}`);
    
  } catch (error) {
    console.error('❌ Error generating Postman collection:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
generatePostmanCollection().catch(console.error); 