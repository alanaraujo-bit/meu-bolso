// Script para testar o problema de data em transações recorrentes
// Simula o comportamento do sistema

// Simula input type="date" do frontend (formato YYYY-MM-DD)
const dataDigitadaPeloUsuario = "2025-02-08"; // 08/02/2025 (data que você tentou inserir)

console.log('=== DEBUG PROBLEMA DE DATA ===');
console.log('Data digitada pelo usuário:', dataDigitadaPeloUsuario);
console.log('Tipo da data recebida:', typeof dataDigitadaPeloUsuario);

// Simula o que o parseDataBrasil faz
function parseDataBrasil(dataString) {
  console.log('\n--- parseDataBrasil ---');
  console.log('Input:', dataString);
  
  const partes = dataString.split('-');
  const ano = parseInt(partes[0]);
  const mes = parseInt(partes[1]) - 1; // JavaScript usa 0-11 para meses
  const dia = parseInt(partes[2]);
  
  console.log('Partes extraídas:', { ano, mes: mes, dia });
  console.log('Mês ajustado (0-based):', mes);
  
  // Criar a data como está sendo feito atualmente
  const data = new Date(ano, mes, dia, 12, 0, 0, 0);
  
  console.log('Data criada:', data);
  console.log('Data em ISO:', data.toISOString());
  console.log('Data em string local:', data.toLocaleDateString('pt-BR'));
  console.log('Dia da data criada:', data.getDate());
  console.log('Mês da data criada (0-based):', data.getMonth());
  console.log('Ano da data criada:', data.getFullYear());
  
  return data;
}

// Testa com a data problema
const resultado = parseDataBrasil(dataDigitadaPeloUsuario);

console.log('\n=== RESULTADO FINAL ===');
console.log('Data original digitada: 08/02/2025');
console.log('Data processada:', resultado.toLocaleDateString('pt-BR'));
console.log('Diferença detectada?', resultado.toLocaleDateString('pt-BR') !== '08/02/2025');

// Testa conversão de volta para formato YYYY-MM-DD
function formatDataBrasil(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  
  return `${ano}-${mes}-${dia}`;
}

const dataConvertidaDeVolta = formatDataBrasil(resultado);
console.log('Data convertida de volta para input:', dataConvertidaDeVolta);
console.log('É igual à original?', dataConvertidaDeVolta === dataDigitadaPeloUsuario);
