const axios = require('axios');

// Configuration
const BACKEND_URL = 'https://v.dobprotocol.com';
const ADMIN_WALLET = 'GCKFBEIYTKP6RJGWLOUQBCGWDLNVTQJDKB7NQIU7SFJBQYDVD5GQJJQJ'; // Admin wallet from seed data

class ProfileFetcher {
  constructor() {
    this.adminToken = null;
    this.allProfiles = [];
  }

  async run() {
    console.log('🔍 Fetching all profiles from deployed backend...\n');
    
    try {
      // Step 1: Authenticate as admin
      await this.authenticateAsAdmin();
      
      // Step 2: Fetch all profiles
      await this.fetchAllProfiles();
      
      // Step 3: Display results
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }

  async authenticateAsAdmin() {
    console.log('🔐 Authenticating as admin...');
    
    try {
      // Get challenge
      const challengeResponse = await axios.post(`${BACKEND_URL}/api/auth/challenge`, {
        walletAddress: ADMIN_WALLET
      });
      
      // Verify signature (using test signature)
      const verifyResponse = await axios.post(`${BACKEND_URL}/api/auth/verify`, {
        walletAddress: ADMIN_WALLET,
        signature: 'admin_test_signature_for_profile_fetch',
        challenge: challengeResponse.data.challenge
      });
      
      this.adminToken = verifyResponse.data.token;
      console.log('✅ Admin authentication successful');
      
    } catch (error) {
      console.error('❌ Admin authentication failed:', error.response?.data || error.message);
      throw new Error('Admin authentication failed');
    }
  }

  async fetchAllProfiles() {
    console.log('\n📊 Fetching all profiles...');
    
    let offset = 0;
    const limit = 50;
    let hasMore = true;
    
    while (hasMore) {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/admin/profiles`, {
          headers: { Authorization: `Bearer ${this.adminToken}` },
          params: { limit, offset }
        });
        
        const { profiles, total, hasMore: more, pagination } = response.data;
        
        console.log(`📄 Fetched ${profiles.length} profiles (${offset + 1}-${offset + profiles.length} of ${total})`);
        
        this.allProfiles.push(...profiles);
        hasMore = more;
        offset += limit;
        
      } catch (error) {
        console.error('❌ Error fetching profiles:', error.response?.data || error.message);
        throw error;
      }
    }
    
    console.log(`✅ Successfully fetched all ${this.allProfiles.length} profiles`);
  }

  displayResults() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 ALL PROFILES FROM DEPLOYED BACKEND');
    console.log('='.repeat(80));
    
    if (this.allProfiles.length === 0) {
      console.log('No profiles found in the database.');
      return;
    }
    
    // Display each profile
    this.allProfiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. Profile Details:`);
      console.log(`   Profile ID: ${profile.id}`);
      console.log(`   Name: ${profile.name}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Company: ${profile.company || 'N/A'}`);
      console.log(`   Wallet Address: ${profile.walletAddress}`);
      console.log(`   Created: ${profile.createdAt}`);
      console.log(`   Updated: ${profile.updatedAt}`);
      
      console.log(`   User Info:`);
      console.log(`     User ID: ${profile.user.id}`);
      console.log(`     User Role: ${profile.user.role}`);
      console.log(`     User Email: ${profile.user.email || 'N/A'}`);
      console.log(`     User Name: ${profile.user.name || 'N/A'}`);
      console.log(`     User Company: ${profile.user.company || 'N/A'}`);
      console.log(`     User Created: ${profile.user.createdAt}`);
      console.log(`     User Updated: ${profile.user.updatedAt}`);
    });
    
    // Summary statistics
    console.log('\n' + '='.repeat(80));
    console.log('📈 SUMMARY STATISTICS');
    console.log('='.repeat(80));
    console.log(`Total Profiles: ${this.allProfiles.length}`);
    
    const roles = {};
    const companies = {};
    const hasCompany = this.allProfiles.filter(p => p.company && p.company.trim() !== '').length;
    const hasEmail = this.allProfiles.filter(p => p.email && p.email.trim() !== '').length;
    
    this.allProfiles.forEach(profile => {
      // Count roles
      const role = profile.user.role;
      roles[role] = (roles[role] || 0) + 1;
      
      // Count companies
      const company = profile.company || 'No Company';
      companies[company] = (companies[company] || 0) + 1;
    });
    
    console.log(`Profiles with Company: ${hasCompany}/${this.allProfiles.length} (${((hasCompany/this.allProfiles.length)*100).toFixed(1)}%)`);
    console.log(`Profiles with Email: ${hasEmail}/${this.allProfiles.length} (${((hasEmail/this.allProfiles.length)*100).toFixed(1)}%)`);
    
    console.log(`\nRole Distribution:`);
    Object.entries(roles).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} (${((count/this.allProfiles.length)*100).toFixed(1)}%)`);
    });
    
    console.log(`\nCompany Distribution:`);
    Object.entries(companies).forEach(([company, count]) => {
      console.log(`  ${company}: ${count} (${((count/this.allProfiles.length)*100).toFixed(1)}%)`);
    });
    
    // Export to JSON file
    const fs = require('fs');
    const exportData = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        totalProfiles: this.allProfiles.length,
        source: 'Deployed Backend API',
        endpoint: `${BACKEND_URL}/api/admin/profiles`
      },
      summary: {
        roles,
        companies,
        profilesWithCompany: hasCompany,
        profilesWithEmail: hasEmail
      },
      profiles: this.allProfiles
    };
    
    const outputPath = './all-profiles-from-backend.json';
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    
    console.log(`\n📁 Data exported to: ${outputPath}`);
    console.log('🎉 Profile fetch completed successfully!');
  }
}

// Run the profile fetcher
async function main() {
  const fetcher = new ProfileFetcher();
  await fetcher.run();
}

main().catch(console.error); 