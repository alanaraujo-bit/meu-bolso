/**
 * 🎯 Script de Teste Local - Transações Recorrentes
 * 
 * Este script permite testar localmente as funcionalidades de transações recorrentes
 * sem precisar usar a interface web. Útil para debugging e validação rápida.
 * 
 * Como usar:
 * 1. node teste-local-recorrentes.js
 * 2. Escolha uma opção do menu
 * 3. Veja os resultados no console
 */

const BASE_URL = 'http://localhost:3000';

// Simular autenticação (você precisará ajustar conforme seu sistema)
const AUTH_HEADERS = {
    'Content-Type': 'application/json',
    // Adicione aqui os headers de autenticação necessários
    // 'Authorization': 'Bearer seu_token_aqui',
    // 'Cookie': 'session=seu_session_aqui'
};

// 🎨 Cores para console
const cores = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// 🔧 Função para log colorido
function log(message, color = 'reset') {
    console.log(`${cores[color]}${message}${cores.reset}`);
}

// 📡 Função para fazer requisições
async function fazerRequisicao(endpoint, options = {}) {
    try {
        const url = `${BASE_URL}${endpoint}`;
        const config = {
            headers: AUTH_HEADERS,
            ...options
        };
        
        log(`🌐 Fazendo requisição: ${options.method || 'GET'} ${url}`, 'cyan');
        
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (response.ok) {
            log(`✅ Sucesso (${response.status})`, 'green');
            return { success: true, data };
        } else {
            log(`❌ Erro (${response.status}): ${data.error || 'Erro desconhecido'}`, 'red');
            return { success: false, error: data.error, status: response.status };
        }
    } catch (error) {
        log(`💥 Erro de conexão: ${error.message}`, 'red');
        return { success: false, error: error.message };
    }
}

// 📊 Listar todas as transações recorrentes
async function listarRecorrentes() {
    log('\n📊 Listando transações recorrentes...', 'blue');
    
    const resultado = await fazerRequisicao('/api/recorrentes');
    
    if (resultado.success) {
        const recorrentes = resultado.data;
        
        if (recorrentes.length === 0) {
            log('📭 Nenhuma transação recorrente encontrada', 'yellow');
            return;
        }
        
        log(`\n📋 Encontradas ${recorrentes.length} transações recorrentes:`, 'bright');
        
        recorrentes.forEach((rec, index) => {
            const status = rec.isActive ? '🟢 Ativa' : '🔴 Inativa';
            const tipo = rec.tipo === 'RECEITA' ? '💰' : '💸';
            
            log(`\n${index + 1}. ${tipo} ${rec.descricao}`, 'bright');
            log(`   📅 Valor: R$ ${rec.valor}`, 'green');
            log(`   📆 Início: ${new Date(rec.dataInicio).toLocaleDateString('pt-BR')}`);
            log(`   🔄 Frequência: ${rec.frequencia}`);
            log(`   ${status}`);
            log(`   🆔 ID: ${rec.id}`, 'cyan');
        });
    }
}

// 🎯 Listar transações pendentes
async function listarPendentes() {
    log('\n🎯 Verificando transações pendentes...', 'blue');
    
    const resultado = await fazerRequisicao('/api/recorrentes/executar');
    
    if (resultado.success) {
        const { pendentes, totalPendentes } = resultado.data;
        
        if (totalPendentes === 0) {
            log('✨ Nenhuma transação pendente! Tudo em dia!', 'green');
            return;
        }
        
        log(`\n⏰ ${totalPendentes} transações pendentes:`, 'yellow');
        
        pendentes.forEach((pend, index) => {
            const tipo = pend.tipo === 'RECEITA' ? '💰' : '💸';
            log(`\n${index + 1}. ${tipo} ${pend.descricao}`, 'bright');
            log(`   💵 Valor: R$ ${pend.valor}`, 'green');
            log(`   📅 Próxima execução: ${new Date(pend.proximaExecucao).toLocaleDateString('pt-BR')}`);
            log(`   🆔 ID: ${pend.id}`, 'cyan');
        });
    }
}

// 🚀 Executar todas as transações pendentes
async function executarTodasPendentes() {
    log('\n🚀 Executando todas as transações pendentes...', 'blue');
    
    // Primeiro, confirmar
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        readline.question('⚠️  Confirma a execução de TODAS as transações pendentes? (s/N): ', async (resposta) => {
            readline.close();
            
            if (resposta.toLowerCase() !== 's') {
                log('❌ Execução cancelada pelo usuário', 'yellow');
                resolve();
                return;
            }
            
            const resultado = await fazerRequisicao('/api/recorrentes/executar', {
                method: 'POST'
            });
            
            if (resultado.success) {
                log(`\n✅ ${resultado.data.message}`, 'green');
                log(`📊 Total de transações criadas: ${resultado.data.totalCriadas || 0}`, 'cyan');
            }
            
            resolve();
        });
    });
}

// 🎯 Executar transação individual
async function executarIndividual() {
    log('\n🎯 Execução individual de transação...', 'blue');
    
    // Primeiro listar as pendentes
    const pendentesResult = await fazerRequisicao('/api/recorrentes/executar');
    
    if (!pendentesResult.success) {
        log('❌ Erro ao buscar transações pendentes', 'red');
        return;
    }
    
    const { pendentes } = pendentesResult.data;
    
    if (pendentes.length === 0) {
        log('✨ Nenhuma transação pendente para executar!', 'green');
        return;
    }
    
    log('\n📋 Transações pendentes disponíveis:', 'bright');
    pendentes.forEach((pend, index) => {
        const tipo = pend.tipo === 'RECEITA' ? '💰' : '💸';
        log(`${index + 1}. ${tipo} ${pend.descricao} - R$ ${pend.valor}`);
    });
    
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        readline.question('\n🔢 Digite o número da transação para executar (ou 0 para cancelar): ', async (resposta) => {
            readline.close();
            
            const index = parseInt(resposta) - 1;
            
            if (resposta === '0') {
                log('❌ Execução cancelada', 'yellow');
                resolve();
                return;
            }
            
            if (isNaN(index) || index < 0 || index >= pendentes.length) {
                log('❌ Número inválido!', 'red');
                resolve();
                return;
            }
            
            const transacao = pendentes[index];
            
            const resultado = await fazerRequisicao('/api/recorrentes/executar', {
                method: 'POST',
                body: JSON.stringify({ recorrenteId: transacao.id })
            });
            
            if (resultado.success) {
                log(`\n✅ ${resultado.data.message}`, 'green');
                log(`🎯 Transação executada: ${transacao.descricao}`, 'cyan');
            }
            
            resolve();
        });
    });
}

// 🔍 Testar uma transação específica
async function testarTransacaoEspecifica() {
    log('\n🔍 Testando transação específica...', 'blue');
    
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        readline.question('🆔 Digite o ID da transação recorrente: ', async (id) => {
            readline.close();
            
            if (!id.trim()) {
                log('❌ ID não fornecido!', 'red');
                resolve();
                return;
            }
            
            log(`\n🔍 Buscando detalhes da transação ${id}...`, 'cyan');
            
            // Tentar executar individualmente
            const resultado = await fazerRequisicao('/api/recorrentes/executar', {
                method: 'POST',
                body: JSON.stringify({ recorrenteId: id })
            });
            
            if (resultado.success) {
                log(`✅ ${resultado.data.message}`, 'green');
            } else {
                log(`❌ Erro: ${resultado.error}`, 'red');
            }
            
            resolve();
        });
    });
}

// 📊 Status geral do sistema
async function statusSistema() {
    log('\n📊 Verificando status geral do sistema...', 'blue');
    
    log('\n1️⃣ Buscando transações recorrentes...', 'cyan');
    const recorrentesResult = await fazerRequisicao('/api/recorrentes');
    
    log('\n2️⃣ Verificando transações pendentes...', 'cyan');
    const pendentesResult = await fazerRequisicao('/api/recorrentes/executar');
    
    if (recorrentesResult.success && pendentesResult.success) {
        const recorrentes = recorrentesResult.data;
        const { totalPendentes } = pendentesResult.data;
        
        const ativas = recorrentes.filter(r => r.isActive).length;
        const inativas = recorrentes.length - ativas;
        
        log('\n📈 RESUMO DO SISTEMA:', 'bright');
        log(`🔄 Total de recorrências: ${recorrentes.length}`, 'cyan');
        log(`🟢 Ativas: ${ativas}`, 'green');
        log(`🔴 Inativas: ${inativas}`, 'red');
        log(`⏰ Pendentes: ${totalPendentes}`, 'yellow');
        
        if (totalPendentes > 0) {
            log('\n⚠️  Existem transações pendentes para execução!', 'yellow');
        } else {
            log('\n✅ Sistema em dia! Nenhuma pendência!', 'green');
        }
    }
}

// 🔧 Função para testar conectividade
async function testarConectividade() {
    log('\n🔧 Testando conectividade com a API...', 'blue');
    
    try {
        const response = await fetch(`${BASE_URL}/api/recorrentes`);
        
        if (response.ok) {
            log('✅ Conectividade OK! API respondendo normalmente.', 'green');
        } else {
            log(`⚠️  API respondeu com status ${response.status}`, 'yellow');
            
            if (response.status === 401) {
                log('🔐 Erro de autenticação. Verifique as credenciais no script.', 'red');
            }
        }
    } catch (error) {
        log(`❌ Erro de conectividade: ${error.message}`, 'red');
        log('💡 Verifique se o servidor está rodando em http://localhost:3000', 'yellow');
    }
}

// 📋 Menu principal
async function mostrarMenu() {
    log('\n' + '='.repeat(60), 'cyan');
    log('🎯 TESTE LOCAL - TRANSAÇÕES RECORRENTES', 'bright');
    log('='.repeat(60), 'cyan');
    
    log('\n📋 Opções disponíveis:', 'bright');
    log('1. 📊 Listar todas as transações recorrentes');
    log('2. 🎯 Listar transações pendentes');
    log('3. 🚀 Executar TODAS as pendentes');
    log('4. 🎯 Executar transação individual');
    log('5. 🔍 Testar transação específica (por ID)');
    log('6. 📊 Status geral do sistema');
    log('7. 🔧 Testar conectividade');
    log('0. 🚪 Sair');
    
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        readline.question('\n🔢 Digite sua opção: ', async (opcao) => {
            readline.close();
            
            switch (opcao) {
                case '1':
                    await listarRecorrentes();
                    break;
                case '2':
                    await listarPendentes();
                    break;
                case '3':
                    await executarTodasPendentes();
                    break;
                case '4':
                    await executarIndividual();
                    break;
                case '5':
                    await testarTransacaoEspecifica();
                    break;
                case '6':
                    await statusSistema();
                    break;
                case '7':
                    await testarConectividade();
                    break;
                case '0':
                    log('\n👋 Tchau! Até a próxima!', 'green');
                    process.exit(0);
                    break;
                default:
                    log('\n❌ Opção inválida!', 'red');
                    break;
            }
            
            // Aguardar enter para continuar
            const rl2 = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            rl2.question('\n⏸️  Pressione ENTER para continuar...', () => {
                rl2.close();
                resolve();
            });
        });
    });
}

// 🚀 Função principal
async function main() {
    log('🎯 Iniciando script de teste local...', 'green');
    
    // Verificar se o fetch está disponível (Node.js 18+)
    if (typeof fetch === 'undefined') {
        log('❌ Este script requer Node.js 18+ (com fetch nativo)', 'red');
        log('💡 Ou instale node-fetch: npm install node-fetch', 'yellow');
        process.exit(1);
    }
    
    // Testar conectividade inicial
    await testarConectividade();
    
    // Loop do menu
    while (true) {
        await mostrarMenu();
    }
}

// 🎬 Executar se for chamado diretamente
if (require.main === module) {
    main().catch(error => {
        log(`💥 Erro fatal: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = {
    fazerRequisicao,
    listarRecorrentes,
    listarPendentes,
    executarTodasPendentes,
    executarIndividual,
    statusSistema,
    testarConectividade
};
