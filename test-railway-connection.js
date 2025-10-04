// Script para testar conectividade com o Railway
const mysql = require('mysql2/promise');

async function testarConexao() {
  console.log('🔍 Testando conectividade com Railway...\n');

  // URLs para testar baseadas na imagem do Railway
  const urls = [
    // URL pública da imagem
    'mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@monorote.proxy.rlwy.net:38165/railway',
    
    // Tentar variações do hostname
    'mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@autorack.proxy.rlwy.net:38165/railway',
    'mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@containers-us-west-105.railway.app:38165/railway',
    
    // URL interna
    'mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@mysql.railway.internal:3306/railway',
    
    // Usando MYSQL_HOST da imagem
    'mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@mysql.railway.internal:3306/railway',
    
    // Tentativa com diferentes portas
    'mysql://root:YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy@monorote.proxy.rlwy.net:3306/railway'
  ];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const isPublic = url.includes('.proxy.rlwy.net') || url.includes('.railway.app');
    
    console.log(`\n${i + 1}. Testando ${isPublic ? 'URL PÚBLICA' : 'URL INTERNA'}:`);
    console.log(`   ${url}`);
    
    try {
      const connection = await mysql.createConnection({
        host: url.includes('monorote.proxy.rlwy.net') ? 'monorote.proxy.rlwy.net' : 
              url.includes('autorack.proxy.rlwy.net') ? 'autorack.proxy.rlwy.net' :
              url.includes('containers-us-west-105.railway.app') ? 'containers-us-west-105.railway.app' :
              'mysql.railway.internal',
        port: url.includes(':38165') ? 38165 : 3306,
        user: 'root',
        password: 'YKEgMjRvoocpBsKhKkAvVxQMesOftlwoYy',
        database: 'railway',
        connectTimeout: 10000, // 10 segundos
        acquireTimeout: 10000,
        timeout: 10000
      });
      
      console.log('   ✅ Conexão estabelecida com sucesso!');
      
      // Testar uma query simples
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log(`   ✅ Query de teste executada: ${JSON.stringify(rows)}`);
      
      // Listar tabelas
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`   📋 Tabelas encontradas: ${tables.length}`);
      
      await connection.end();
      console.log('   ✅ Conexão fechada com sucesso');
      
      // Se chegou até aqui, esta URL funciona
      console.log(`\n🎯 URL FUNCIONAL ENCONTRADA:`);
      console.log(`DATABASE_URL="${url}"`);
      return url;
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
      if (error.code) {
        console.log(`   📍 Código: ${error.code}`);
      }
    }
  }
  
  console.log('\n❌ Nenhuma URL funcionou.');
  console.log('\n🔧 SOLUÇÕES POSSÍVEIS:');
  console.log('1. Verificar se o serviço MySQL está ativo no Railway Dashboard');
  console.log('2. Copiar as credenciais EXATAS do Railway Dashboard');
  console.log('3. Verificar se há whitelist de IPs no Railway');
  console.log('4. Tentar acessar via Railway CLI: railway login && railway connect');
  console.log('5. Verificar logs do serviço no Railway');
}

// Função para testar individualmente
async function testarURL(url) {
  console.log(`\n🔍 Testando URL específica: ${url}`);
  
  try {
    // Parse da URL
    const urlObj = new URL(url);
    
    const connection = await mysql.createConnection({
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 3306,
      user: urlObj.username,
      password: urlObj.password,
      database: urlObj.pathname.replace('/', ''),
      connectTimeout: 15000,
      acquireTimeout: 15000,
      timeout: 15000
    });
    
    console.log('✅ Conectado com sucesso!');
    
    const [result] = await connection.execute('SELECT VERSION() as version');
    console.log(`📊 Versão MySQL: ${result[0].version}`);
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Tabelas: ${tables.length}`);
    
    await connection.end();
    return true;
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return false;
  }
}

// Se foi chamado com um argumento, testar URL específica
if (process.argv[2]) {
  testarURL(process.argv[2]);
} else {
  testarConexao();
}