const fetch = require('node-fetch');

async function testarExclusao() {
  try {
    // Primeiro criar uma transação de teste
    console.log('🔧 Criando transação de teste...');
    const criarRes = await fetch('http://localhost:3000/api/transacoes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tipo: 'despesa',
        valor: 1.50,
        descricao: 'Teste de exclusão',
        data: new Date().toISOString().split('T')[0]
      })
    });
    
    if (!criarRes.ok) {
      console.error('❌ Erro ao criar transação:', await criarRes.text());
      return;
    }
    
    const novaTransacao = await criarRes.json();
    console.log('✅ Transação criada:', novaTransacao.id);
    
    // Tentar excluir
    console.log('🗑️ Tentando excluir transação...');
    const excluirRes = await fetch(`http://localhost:3000/api/transacoes/${novaTransacao.id}`, {
      method: 'DELETE'
    });
    
    console.log('📊 Resposta da exclusão:', {
      status: excluirRes.status,
      statusText: excluirRes.statusText,
      ok: excluirRes.ok
    });
    
    const resultado = await excluirRes.text();
    console.log('📄 Corpo da resposta:', resultado);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testarExclusao();