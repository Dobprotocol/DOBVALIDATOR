const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const walletAddress = 'GCBA5O2JDZMG4TKBHAGWEQTMLTTHIPERZVQDQGGRYAIL3HAAJ3BAL3ZN';
    
    console.log('🔍 Checking for user with wallet address:', walletAddress);
    
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { profile: true }
    });
    
    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        name: user.name,
        company: user.company,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        hasProfile: !!user.profile
      });
    } else {
      console.log('❌ User not found in database');
      console.log('🔍 Creating user now...');
      
      const newUser = await prisma.user.create({
        data: {
          walletAddress,
          email: null,
          name: null,
          company: null,
          role: 'OPERATOR'
        }
      });
      
      console.log('✅ User created:', {
        id: newUser.id,
        walletAddress: newUser.walletAddress,
        role: newUser.role
      });
    }
    
    // Also check all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, walletAddress: true, role: true, createdAt: true }
    });
    
    console.log('\n📊 All users in database:', allUsers);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser(); 