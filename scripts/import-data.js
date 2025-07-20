const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importData(backupFilePath) {
  try {
    console.log('🔄 Iniciando importação dos dados...');

    // Ler arquivo de backup
    if (!fs.existsSync(backupFilePath)) {
      console.error('❌ Arquivo de backup não encontrado:', backupFilePath);
      return;
    }

    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    console.log(`📅 Backup criado em: ${backupData.exportDate}`);
    console.log(`👥 Total de usuários: ${backupData.usuarios.length}`);

    // Limpar dados existentes (cuidado!)
    console.log('🧹 Limpando dados existentes...');
    await prisma.transacao.deleteMany();
    await prisma.meta.deleteMany();
    await prisma.transacaoRecorrente.deleteMany();
    await prisma.categoria.deleteMany();
    await prisma.usuario.deleteMany();

    let importedUsers = 0;
    let importedCategories = 0;
    let importedTransactions = 0;
    let importedGoals = 0;
    let importedRecurring = 0;

    // Importar usuários e dados relacionados
    for (const usuario of backupData.usuarios) {
      console.log(`👤 Importando usuário: ${usuario.email}`);

      // Criar usuário
      const newUser = await prisma.usuario.create({
        data: {
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          senha: usuario.senha,
          avatar: usuario.avatar,
          criadoEm: new Date(usuario.criadoEm),
          atualizadoEm: new Date(usuario.atualizadoEm)
        }
      });
      importedUsers++;

      // Importar categorias
      for (const categoria of usuario.categorias) {
        await prisma.categoria.create({
          data: {
            id: categoria.id,
            userId: newUser.id,
            nome: categoria.nome,
            tipo: categoria.tipo,
            cor: categoria.cor,
            icone: categoria.icone,
            criadoEm: new Date(categoria.criadoEm),
            atualizadoEm: new Date(categoria.atualizadoEm)
          }
        });
        importedCategories++;
      }

      // Importar metas
      for (const meta of usuario.metas) {
        await prisma.meta.create({
          data: {
            id: meta.id,
            userId: newUser.id,
            nome: meta.nome,
            valorAlvo: meta.valorAlvo,
            currentAmount: meta.currentAmount,
            dataAlvo: new Date(meta.dataAlvo),
            isCompleted: meta.isCompleted,
            criadoEm: new Date(meta.criadoEm),
            atualizadoEm: new Date(meta.atualizadoEm)
          }
        });
        importedGoals++;
      }

      // Importar transações recorrentes
      for (const recorrente of usuario.transacoesRecorrentes) {
        await prisma.transacaoRecorrente.create({
          data: {
            id: recorrente.id,
            userId: newUser.id,
            categoriaId: recorrente.categoriaId,
            tipo: recorrente.tipo,
            valor: recorrente.valor,
            descricao: recorrente.descricao,
            frequencia: recorrente.frequencia,
            dataInicio: new Date(recorrente.dataInicio),
            dataFim: recorrente.dataFim ? new Date(recorrente.dataFim) : null,
            isActive: recorrente.isActive,
            criadoEm: new Date(recorrente.criadoEm),
            atualizadoEm: new Date(recorrente.atualizadoEm)
          }
        });
        importedRecurring++;
      }

      // Importar transações
      for (const transacao of usuario.transacoes) {
        await prisma.transacao.create({
          data: {
            id: transacao.id,
            userId: newUser.id,
            categoriaId: transacao.categoriaId,
            tipo: transacao.tipo,
            valor: transacao.valor,
            descricao: transacao.descricao,
            data: new Date(transacao.data),
            tags: transacao.tags,
            anexos: transacao.anexos,
            isRecorrente: transacao.isRecorrente,
            transacaoRecorrenteId: transacao.transacaoRecorrenteId,
            metaId: transacao.metaId,
            criadoEm: new Date(transacao.criadoEm),
            atualizadoEm: new Date(transacao.atualizadoEm)
          }
        });
        importedTransactions++;
      }

      console.log(`✅ Usuário ${usuario.email} importado com sucesso!`);
    }

    console.log('\n🎉 Importação concluída com sucesso!');
    console.log(`📊 Resumo da importação:`);
    console.log(`   - Usuários: ${importedUsers}`);
    console.log(`   - Categorias: ${importedCategories}`);
    console.log(`   - Transações: ${importedTransactions}`);
    console.log(`   - Metas: ${importedGoals}`);
    console.log(`   - Transações Recorrentes: ${importedRecurring}`);

  } catch (error) {
    console.error('❌ Erro ao importar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Usar o script
const backupFile = process.argv[2];
if (!backupFile) {
  console.error('❌ Por favor, forneça o caminho do arquivo de backup');
  console.log('Uso: node import-data.js <caminho-do-backup>');
  process.exit(1);
}

importData(backupFile);