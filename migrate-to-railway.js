// Script para migrar dados do MySQL VPS antigo para Railway
// Usa Prisma para garantir compatibilidade total

const { PrismaClient } = require('@prisma/client');

// Configurações dos bancos
const OLD_DATABASE_URL = "mysql://alanaraujo:MysqL_2025_segura@148.230.72.122:3306/meu_bolso_db";
const NEW_DATABASE_URL = "mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@monorote.proxy.rlwy.net:38165/railway";

// Criar instâncias do Prisma
const prismaOld = new PrismaClient({ datasources: { db: { url: OLD_DATABASE_URL } } });
const prismaNew = new PrismaClient({ datasources: { db: { url: NEW_DATABASE_URL } } });

async function migrarDados() {
  console.log('🚀 Iniciando migração do MySQL VPS para Railway...\n');

  try {
    // 1. Testar conexões
    console.log('📋 Etapa 1: Testando conexões...');
    await prismaOld.$connect();
    console.log('✅ Conectado ao banco antigo (VPS)');
    
    await prismaNew.$connect();
    console.log('✅ Conectado ao banco novo (Railway)\n');

    // 2. Buscar dados do banco antigo
    console.log('📋 Etapa 2: Buscando dados do banco antigo...');
    
    const usuarios = await prismaOld.usuario.findMany({
      include: {
        categorias: true,
        transacoes: true,
        transacoesRecorrentes: true,
        metas: true,
        dividas: {
          include: {
            parcelas: true
          }
        }
      }
    });

    console.log(`✅ ${usuarios.length} usuário(s) encontrado(s)\n`);

    // 3. Migrar cada usuário e seus dados
    console.log('📋 Etapa 3: Migrando dados para o Railway...');
    
    for (const usuario of usuarios) {
      console.log(`\n👤 Migrando usuário: ${usuario.email}`);
      
      // Criar usuário
      const novoUsuario = await prismaNew.usuario.create({
        data: {
          id: usuario.id,
          email: usuario.email,
          senha: usuario.senha,
          nome: usuario.nome,
          avatarUrl: usuario.avatarUrl,
          criadoEm: usuario.criadoEm,
          atualizadoEm: usuario.atualizadoEm,
          ultimaAtividade: usuario.ultimaAtividade,
          statusOnline: usuario.statusOnline,
          ultimoAcesso: usuario.ultimoAcesso,
          tempoSessao: usuario.tempoSessao,
          dispositivoAtual: usuario.dispositivoAtual,
          ipAtual: usuario.ipAtual,
          tema: usuario.tema,
          formatoMoeda: usuario.formatoMoeda,
          confirmarExclusoes: usuario.confirmarExclusoes,
          timeoutSessao: usuario.timeoutSessao,
          paginaInicial: usuario.paginaInicial,
          isAdmin: usuario.isAdmin
        }
      });
      
      console.log('  ✅ Usuário criado');

      // Migrar categorias
      if (usuario.categorias.length > 0) {
        for (const categoria of usuario.categorias) {
          await prismaNew.categoria.create({
            data: {
              id: categoria.id,
              nome: categoria.nome,
              cor: categoria.cor,
              icone: categoria.icone,
              tipo: categoria.tipo,
              userId: novoUsuario.id,
              criadoEm: categoria.criadoEm
            }
          });
        }
        console.log(`  ✅ ${usuario.categorias.length} categoria(s) migrada(s)`);
      }

      // Migrar transações
      if (usuario.transacoes.length > 0) {
        for (const transacao of usuario.transacoes) {
          await prismaNew.transacao.create({
            data: {
              id: transacao.id,
              tipo: transacao.tipo,
              valor: transacao.valor,
              descricao: transacao.descricao,
              data: transacao.data,
              isRecorrente: transacao.isRecorrente,
              userId: novoUsuario.id,
              categoriaId: transacao.categoriaId,
              recorrenteId: transacao.recorrenteId,
              criadoEm: transacao.criadoEm
            }
          });
        }
        console.log(`  ✅ ${usuario.transacoes.length} transação(ões) migrada(s)`);
      }

      // Migrar transações recorrentes
      if (usuario.transacoesRecorrentes.length > 0) {
        for (const recorrente of usuario.transacoesRecorrentes) {
          await prismaNew.transacaoRecorrente.create({
            data: {
              id: recorrente.id,
              tipo: recorrente.tipo,
              valor: recorrente.valor,
              descricao: recorrente.descricao,
              frequencia: recorrente.frequencia,
              dataInicio: recorrente.dataInicio,
              dataFim: recorrente.dataFim,
              isActive: recorrente.isActive,
              userId: novoUsuario.id,
              categoriaId: recorrente.categoriaId,
              criadoEm: recorrente.criadoEm
            }
          });
        }
        console.log(`  ✅ ${usuario.transacoesRecorrentes.length} recorrente(s) migrada(s)`);
      }

      // Migrar metas
      if (usuario.metas.length > 0) {
        for (const meta of usuario.metas) {
          await prismaNew.meta.create({
            data: {
              id: meta.id,
              nome: meta.nome,
              valorAlvo: meta.valorAlvo,
              currentAmount: meta.currentAmount,
              dataAlvo: meta.dataAlvo,
              isCompleted: meta.isCompleted,
              userId: novoUsuario.id,
              criadoEm: meta.criadoEm
            }
          });
        }
        console.log(`  ✅ ${usuario.metas.length} meta(s) migrada(s)`);
      }

      // Migrar dívidas e parcelas
      if (usuario.dividas.length > 0) {
        for (const divida of usuario.dividas) {
          const novaDivida = await prismaNew.divida.create({
            data: {
              id: divida.id,
              nome: divida.nome,
              valorTotal: divida.valorTotal,
              valorParcela: divida.valorParcela,
              numeroParcelas: divida.numeroParcelas,
              dataInicio: divida.dataInicio,
              status: divida.status,
              userId: novoUsuario.id,
              categoriaId: divida.categoriaId,
              criadoEm: divida.criadoEm
            }
          });

          // Migrar parcelas
          for (const parcela of divida.parcelas) {
            await prismaNew.parcelaDivida.create({
              data: {
                id: parcela.id,
                numero: parcela.numero,
                valor: parcela.valor,
                dataVencimento: parcela.dataVencimento,
                status: parcela.status,
                dividaId: novaDivida.id,
                criadoEm: parcela.criadoEm
              }
            });
          }
        }
        console.log(`  ✅ ${usuario.dividas.length} dívida(s) migrada(s)`);
      }
    }

    console.log('\n✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!\n');
    
    // 4. Verificar dados migrados
    console.log('📋 Etapa 4: Verificando dados migrados...');
    const usuariosNovos = await prismaNew.usuario.count();
    const categoriasNovas = await prismaNew.categoria.count();
    const transacoesNovas = await prismaNew.transacao.count();
    const recorrentesNovas = await prismaNew.transacaoRecorrente.count();
    const metasNovas = await prismaNew.meta.count();
    const dividasNovas = await prismaNew.divida.count();

    console.log('\n📊 Resumo da migração:');
    console.log(`  Usuários: ${usuariosNovos}`);
    console.log(`  Categorias: ${categoriasNovas}`);
    console.log(`  Transações: ${transacoesNovas}`);
    console.log(`  Recorrentes: ${recorrentesNovas}`);
    console.log(`  Metas: ${metasNovas}`);
    console.log(`  Dívidas: ${dividasNovas}`);
    
    console.log('\n📝 Próximos passos:');
    console.log('1. Execute "npx prisma studio" para verificar os dados');
    console.log('2. Teste a aplicação localmente com "npm run dev"');
    console.log('3. Atualize as variáveis de ambiente no servidor de produção');
    console.log('4. Faça o deploy\n');

  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await prismaOld.$disconnect();
    await prismaNew.$disconnect();
  }
}

// Executar migração
migrarDados();
