// Test Database Setup
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vvkbwiwaernhclsojirf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a2J3aXdhZXJuaGNsc29qaXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzQ2MDYsImV4cCI6MjA2NjU1MDYwNn0.4_ikMFDXibAd25hF7ika5qyk2PHkRy_E6Dl4r0A3TGg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseSetup() {
  console.log('🔍 Testing Database Setup...\n')
  
  const tables = [
    'users',
    'profiles', 
    'submissions',
    'drafts',
    'submission_files',
    'draft_files',
    'admin_reviews',
    'certificates',
    'auth_challenges',
    'auth_sessions'
  ]
  
  let allTablesExist = true
  
  for (const table of tables) {
    try {
      console.log(`Testing table: ${table}`)
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table ${table} does not exist or has issues:`, error.message)
        allTablesExist = false
      } else {
        console.log(`✅ Table ${table} exists and is accessible`)
      }
    } catch (error) {
      console.log(`❌ Error testing table ${table}:`, error.message)
      allTablesExist = false
    }
  }
  
  console.log('\n' + '='.repeat(50))
  
  if (allTablesExist) {
    console.log('🎉 All tables are properly set up!')
    
    // Test creating a user
    console.log('\n🧪 Testing user creation...')
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          wallet_address: 'test-wallet-' + Date.now(),
          role: 'OPERATOR'
        })
        .select()
        .single()
      
      if (userError) {
        console.log('❌ User creation failed:', userError.message)
      } else {
        console.log('✅ User creation successful:', user.id)
        
        // Clean up test user
        await supabase
          .from('users')
          .delete()
          .eq('id', user.id)
        
        console.log('🧹 Test user cleaned up')
      }
    } catch (error) {
      console.log('❌ User creation test failed:', error.message)
    }
    
  } else {
    console.log('❌ Some tables are missing or have issues')
    console.log('Please run the SQL script in Supabase SQL Editor')
  }
  
  console.log('\n' + '='.repeat(50))
}

testDatabaseSetup() 