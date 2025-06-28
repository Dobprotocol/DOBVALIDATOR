// Test Supabase connection
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vvkbwiwaernhclsojirf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a2J3aXdhZXJuaGNsc29qaXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzQ2MDYsImV4cCI6MjA2NjU1MDYwNn0.4_ikMFDXibAd25hF7ika5qyk2PHkRy_E6Dl4r0A3TGg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('Response:', data)
    return true
    
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error)
    return false
  }
}

testConnection() 