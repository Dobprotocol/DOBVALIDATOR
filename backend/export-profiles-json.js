const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportProfilesToJSON() {
  console.log('🔍 Exporting all profiles to JSON...');
  
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
    
    // Create comprehensive export
    const exportData = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        totalProfiles: profiles.length,
        description: "All profile entries from DOB Validator database"
      },
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
        profilesWithCompany: profiles.filter(p => p.company && p.company.trim() !== '').length,
        profilesWithEmail: profiles.filter(p => p.email && p.email.trim() !== '').length
      },
      profiles: profiles.map((profile, index) => ({
        index: index + 1,
        profileId: profile.id,
        userId: profile.userId,
        name: profile.name,
        email: profile.email,
        company: profile.company,
        walletAddress: profile.walletAddress,
        userRole: profile.user.role,
        userEmail: profile.user.email,
        userCompany: profile.user.company,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
        userCreatedAt: profile.user.createdAt.toISOString(),
        userUpdatedAt: profile.user.updatedAt.toISOString()
      }))
    };
    
    // Write to file
    const outputPath = './profiles-export.json';
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    
    console.log('\n✅ Profiles exported successfully!');
    console.log(`📁 File: ${outputPath}`);
    console.log(`📊 Total profiles: ${profiles.length}`);
    
    // Display summary
    console.log('\n📈 Summary:');
    console.log(`- Roles: ${JSON.stringify(exportData.summary.roles)}`);
    console.log(`- Profiles with company: ${exportData.summary.profilesWithCompany}/${profiles.length}`);
    console.log(`- Profiles with email: ${exportData.summary.profilesWithEmail}/${profiles.length}`);
    
    // Display first few profiles
    console.log('\n👥 First 3 profiles:');
    exportData.profiles.slice(0, 3).forEach(profile => {
      console.log(`  ${profile.index}. ${profile.name} (${profile.walletAddress})`);
      console.log(`     Role: ${profile.userRole}, Company: ${profile.company || 'N/A'}`);
    });
    
    if (profiles.length > 3) {
      console.log(`  ... and ${profiles.length - 3} more profiles`);
    }
    
  } catch (error) {
    console.error('❌ Error exporting profiles:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
exportProfilesToJSON().catch(console.error); 