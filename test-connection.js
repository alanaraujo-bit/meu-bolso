const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('🔍 Testando conexão com Railway...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    const usuarios = await prisma.usuario.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        nome: true,
      }
    });
    
    console.log('✅ Conexão bem-sucedida!');
    console.log('📊 Usuários encontrados:', usuarios.length);
    console.log('👥 Primeiros usuários:', usuarios);
    
    // Testar usuário específico
    const usuario = await prisma.usuario.findUnique({
      where: { email: 'alanvitoraraujo2a@gmail.com' }
    });
    
    if (usuario) {
      console.log('✅ Usuário encontrado:', usuario.email);
    } else {
      console.log('❌ Usuário não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
