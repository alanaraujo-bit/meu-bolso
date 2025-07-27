// Opções de MySQL gratuito
const providers = [
  {
    name: 'Clever Cloud',
    url: 'https://clever-cloud.com',
    storage: '1GB',
    features: ['MySQL 8.0', 'Backup automático', 'SSL incluído', 'Sem cartão de crédito'],
    setup: 'Cadastro simples → Create MySQL → Copiar credenciais',
    recommended: true
  },
  {
    name: 'db4free.net',
    url: 'https://db4free.net',
    storage: '200MB',
    features: ['MySQL 8.0', 'Gratuito permanente', 'Comunidade ativa'],
    setup: 'Cadastro → Ativação por email → Criar database',
    recommended: false
  },
  {
    name: 'FreeSQLDatabase',
    url: 'https://freesqldatabase.com',
    storage: '5MB',
    features: ['MySQL 5.7', 'Criação instantânea', 'Sem registro'],
    setup: 'Acesse o site → Crie database → Use imediatamente',
    recommended: false
  },
  {
    name: 'InfinityFree',
    url: 'https://infinityfree.net',
    storage: '5GB',
    features: ['Unlimited databases', 'cPanel incluído', 'PHP/MySQL'],
    setup: 'Cadastro → Criar subdomain → Acessar cPanel → MySQL',
    recommended: false
  }
];

function displayProviders() {
  console.log('🆓 OPÇÕES DE MYSQL 100% GRATUITAS\n');
  
  providers.forEach((provider, index) => {
    const star = provider.recommended ? '⭐ ' : '   ';
    console.log(`${star}${index + 1}. ${provider.name} (${provider.storage})`);
    console.log(`      🔗 ${provider.url}`);
    console.log(`      ✨ Recursos:`);
    provider.features.forEach(feature => {
      console.log(`         • ${feature}`);
    });
    console.log(`      🚀 Setup: ${provider.setup}`);
    console.log('');
  });

  console.log('📋 RECOMENDAÇÃO PRINCIPAL:');
  console.log('⭐ Clever Cloud - Melhor opção gratuita');
  console.log('   • 1GB de storage (suficiente para projetos médios)');
  console.log('   • MySQL 8.0 (mais recente)');
  console.log('   • Backup automático');
  console.log('   • SSL/TLS incluído');
  console.log('   • Interface amigável');
  console.log('');
  
  console.log('🎯 PRÓXIMOS PASSOS:');
  console.log('1. Acesse: https://clever-cloud.com');
  console.log('2. Clique em "Sign up for free"');
  console.log('3. Crie uma conta (sem cartão de crédito)');
  console.log('4. Create → MySQL → Copie as credenciais');
  console.log('5. Configure DATABASE_URL no .env');
  console.log('6. Execute: npx prisma db push');
  console.log('7. Execute: npm run dev');
  console.log('');
  
  console.log('💡 DICAS:');
  console.log('• Para desenvolvimento: db4free.net (200MB)');
  console.log('• Para testes rápidos: FreeSQLDatabase (5MB)');
  console.log('• Para projetos grandes: InfinityFree (5GB)');
  console.log('• Para produção: Clever Cloud (1GB + confiabilidade)');
}

// Se for executado diretamente
if (require.main === module) {
  displayProviders();
}

module.exports = { providers };