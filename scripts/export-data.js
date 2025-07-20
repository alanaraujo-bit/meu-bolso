const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('🔄 Iniciando exportação dos dados...');

    // Exportar usuários
    const usuarios = await prisma.usuario.findMany({
      include: {
        categorias: true,
        transacoes: {
          include: {
            categoria: true,
            meta: true,
            transacaoRecorrente: true
          }
        },
        metas: {
          include: {
            transacoes: true
          }
        },
        transacoesRecorrentes: {
          include: {
            categoria: true,
            transacoes: true
          }
        }
      }
    });

    // Criar diretório de backup se não existir
    const backupDir = path.join(__dirname, '../backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Salvar dados em arquivo JSON
    const backupData = {
      exportDate: new Date().toISOString(),
      usuarios: usuarios
    };

    const backupFile = path.join(backupDir, `backup-${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    console.log(`✅ Dados exportados com sucesso para: ${backupFile}`);
    console.log(`📊 Total de usuários exportados: ${usuarios.length}`);
    
    // Estatísticas
    let totalTransacoes = 0;
    let totalCategorias = 0;
    let totalMetas = 0;
    let totalRecorrentes = 0;

    usuarios.forEach(usuario => {
      totalTransacoes += usuario.transacoes.length;
      totalCategorias += usuario.categorias.length;
      totalMetas += usuario.metas.length;
      totalRecorrentes += usuario.transacoesRecorrentes.length;
    });

    console.log(`📈 Estatísticas do backup:`);
    console.log(`   - Transações: ${totalTransacoes}`);
    console.log(`   - Categorias: ${totalCategorias}`);
    console.log(`   - Metas: ${totalMetas}`);
    console.log(`   - Transações Recorrentes: ${totalRecorrentes}`);

  } catch (error) {
    console.error('❌ Erro ao exportar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();