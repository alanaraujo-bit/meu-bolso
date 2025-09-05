// Script para testar a precisão do timezone
// Execute: node teste-timezone-precisao.js

// Importar configuração de timezone
require('./src/lib/timezoneConfig.ts');

console.log('🧪 TESTE DE PRECISÃO DO TIMEZONE\n');

// Função para obter informações detalhadas
function testarTimezone() {
  const agora = new Date();
  
  console.log('📅 Data/Hora Atual:');
  console.log('  Local:', agora.toLocaleString());
  console.log('  UTC:', agora.toUTCString());
  console.log('  ISO:', agora.toISOString());
  console.log('  Brasil:', agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
  
  console.log('\n🌍 Informações do Timezone:');
  console.log('  Process TZ:', process.env.TZ);
  console.log('  Process TIMEZONE:', process.env.TIMEZONE);
  console.log('  Offset (minutos):', agora.getTimezoneOffset());
  console.log('  Timezone detectado:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  console.log('\n⏰ Comparação de Horários:');
  const formatoBrasil = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'full',
    timeStyle: 'full'
  });
  console.log('  Brasil (Intl):', formatoBrasil.format(agora));
  
  const formatoUTC = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    dateStyle: 'full',
    timeStyle: 'full'
  });
  console.log('  UTC (Intl):', formatoUTC.format(agora));
  
  console.log('\n✅ Teste de Criação de Datas:');
  const data1 = new Date('2025-09-05');
  const data2 = new Date(2025, 8, 5); // mês 8 = setembro (0-based)
  const data3 = new Date('2025-09-05T15:30:00');
  
  console.log('  new Date("2025-09-05"):', data1.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
  console.log('  new Date(2025, 8, 5):', data2.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
  console.log('  new Date("2025-09-05T15:30:00"):', data3.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
  
  return {
    sucesso: true,
    timezone: process.env.TZ,
    dataAtual: agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  };
}

// Executar teste
try {
  const resultado = testarTimezone();
  console.log('\n🎯 RESULTADO:', resultado.sucesso ? 'SUCESSO' : 'ERRO');
  console.log('🇧🇷 Timezone configurado para Brasil:', resultado.timezone === 'America/Sao_Paulo');
} catch (error) {
  console.error('❌ ERRO no teste:', error);
}
