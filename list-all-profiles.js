const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAllProfiles() {
  console.log('🔍 Listing all profiles in the database...\n');
  
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
    
    console.log(`📊 Found ${profiles.length} profiles in database\n`);
    
    if (profiles.length === 0) {
      console.log('No profiles found in the database.');
      return;
    }
    
    // Display each profile
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. Profile Details:`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Name: ${profile.name}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Company: ${profile.company || 'N/A'}`);
      console.log(`   Wallet Address: ${profile.walletAddress}`);
      console.log(`   Created: ${profile.createdAt.toISOString()}`);
      console.log(`   Updated: ${profile.updatedAt.toISOString()}`);
      
      console.log(`   User Info:`);
      console.log(`     User ID: ${profile.user.id}`);
      console.log(`     User Role: ${profile.user.role}`);
      console.log(`     User Email: ${profile.user.email || 'N/A'}`);
      console.log(`     User Name: ${profile.user.name || 'N/A'}`);
      console.log(`     User Company: ${profile.user.company || 'N/A'}`);
      console.log(`     User Created: ${profile.user.createdAt.toISOString()}`);
      console.log(`     User Updated: ${profile.user.updatedAt.toISOString()}`);
      
      console.log(''); // Empty line for separation
    });
    
    // Summary statistics
    console.log('📈 Summary Statistics:');
    console.log(`Total Profiles: ${profiles.length}`);
    
    const roles = {};
    const companies = {};
    const hasCompany = profiles.filter(p => p.company && p.company.trim() !== '').length;
    
    profiles.forEach(profile => {
      // Count roles
      const role = profile.user.role;
      roles[role] = (roles[role] || 0) + 1;
      
      // Count companies
      const company = profile.company || 'No Company';
      companies[company] = (companies[company] || 0) + 1;
    });
    
    console.log(`Profiles with Company: ${hasCompany}/${profiles.length} (${((hasCompany/profiles.length)*100).toFixed(1)}%)`);
    console.log(`Role Distribution:`);
    Object.entries(roles).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} (${((count/profiles.length)*100).toFixed(1)}%)`);
    });
    
    console.log(`\nCompany Distribution:`);
    Object.entries(companies).forEach(([company, count]) => {
      console.log(`  ${company}: ${count} (${((count/profiles.length)*100).toFixed(1)}%)`);
    });
    
    // Check for potential issues
    console.log('\n🔍 Data Quality Check:');
    
    const issues = [];
    profiles.forEach((profile, index) => {
      if (!profile.name || profile.name.trim() === '') {
        issues.push(`Profile ${index + 1}: Missing name`);
      }
      if (!profile.email || profile.email.trim() === '') {
        issues.push(`Profile ${index + 1}: Missing email`);
      }
      if (!profile.walletAddress || profile.walletAddress.trim() === '') {
        issues.push(`Profile ${index + 1}: Missing wallet address`);
      }
      if (profile.updatedAt < profile.createdAt) {
        issues.push(`Profile ${index + 1}: Updated timestamp is before created timestamp`);
      }
    });
    
    if (issues.length === 0) {
      console.log('✅ No data quality issues found');
    } else {
      console.log(`⚠️  Found ${issues.length} potential issues:`);
      issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
  } catch (error) {
    console.error('❌ Error fetching profiles:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
listAllProfiles().catch(console.error); 