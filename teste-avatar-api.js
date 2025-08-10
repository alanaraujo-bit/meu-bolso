// Script para testar a API de avatar diretamente
const testAvatarAPI = async () => {
  try {
    console.log('🧪 Testando API de avatar...');
    
    const response = await fetch('http://localhost:3000/api/usuario/avatar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Você precisará estar logado para que isso funcione
      },
      body: JSON.stringify({
        avatarUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      })
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (!response.ok) {
      console.error('❌ Erro na API:', data);
    } else {
      console.log('✅ API funcionou:', data);
    }
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error);
  }
};

// Executar o teste
testAvatarAPI();
