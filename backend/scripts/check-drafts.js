const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDrafts() {
  try {
    console.log('🔍 Checking for drafts in database...')
    
    const drafts = await prisma.draft.findMany({
      include: {
        user: {
          select: {
            walletAddress: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log(`✅ Found ${drafts.length} drafts:`)
    
    drafts.forEach((draft, index) => {
      console.log(`\n${index + 1}. Draft ID: ${draft.id}`)
      console.log(`   Device Name: ${draft.deviceName || 'Not set'}`)
      console.log(`   Device Type: ${draft.deviceType || 'Not set'}`)
      console.log(`   Manufacturer: ${draft.manufacturer || 'Not set'}`)
      console.log(`   Model: ${draft.model || 'Not set'}`)
      console.log(`   Created: ${draft.createdAt}`)
      console.log(`   Updated: ${draft.updatedAt}`)
      console.log(`   User: ${draft.user?.walletAddress || 'Unknown'}`)
    })
    
    if (drafts.length === 0) {
      console.log('\n❌ No drafts found in database')
    }
    
  } catch (error) {
    console.error('❌ Error checking drafts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDrafts() 