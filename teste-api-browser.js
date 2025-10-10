// Teste manual da API de edição de valores
// Execute no console do navegador quando estiver logado

async function testarAPIEditarValor() {
  console.log('🧪 Testando API de edição de valor...');
  
  try {
    // Primeiro, vamos buscar uma dívida para pegar os IDs
    const responseDividas = await fetch('/api/dividas');
    const dividas = await responseDividas.json();
    
    if (dividas.length === 0) {
      console.log('❌ Nenhuma dívida encontrada para teste');
      return;
    }
    
    const primeiraDiv = dividas[0];
    console.log('📋 Usando dívida:', primeiraDiv.nome);
    
    if (primeiraDiv.parcelas.length === 0) {
      console.log('❌ Nenhuma parcela encontrada para teste');
      return;
    }
    
    // Pegar a primeira parcela pendente
    const parcelaPendente = primeiraDiv.parcelas.find(p => p.status === 'PENDENTE');
    if (!parcelaPendente) {
      console.log('❌ Nenhuma parcela pendente encontrada para teste');
      return;
    }
    
    console.log('📦 Usando parcela:', parcelaPendente.numero, 'Valor atual:', parcelaPendente.valor);
    
    // Testar a API
    const novoValor = parseFloat(parcelaPendente.valor) + 100;
    console.log('🔄 Testando mudança para:', novoValor);
    
    const response = await fetch(`/api/dividas/${primeiraDiv.id}/parcelas/${parcelaPendente.id}/valor`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ novoValor })
    });
    
    console.log('📡 Status da resposta:', response.status);
    
    if (response.ok) {
      const resultado = await response.json();
      console.log('✅ Sucesso!', resultado);
    } else {
      const erro = await response.json();
      console.log('❌ Erro:', erro);
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Para executar o teste, cole no console do navegador:
// testarAPIEditarValor()

console.log('📋 Script carregado! Execute testarAPIEditarValor() para testar a API');