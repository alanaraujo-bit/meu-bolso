import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Usuários temporários para teste
const TEMP_USERS = [
  {
    id: '1',
    email: 'teste@teste.com',
    nome: 'Usuário Teste',
    senha: '$2b$10$g92IzJGsugx/Olm/4WqHJO3SHiJb9vqMiXSOVEfG4yD0Yy1znTN2q' // password: 123456
  },
  {
    id: '2',
    email: 'alanvitoraraujo1a@outlook.com',
    nome: 'Alan Araújo - Admin',
    senha: '$2b$10$sqFIaTQ2ZSO2tvrhYJKMgepfk5NlYlHjQjk.mjwr3z/fYRe2wLM02' // password: Sucesso@2025#
  },
  {
    id: '3',
    email: 'admin@admin.com',
    nome: 'Administrador',
    senha: '$2b$10$g92IzJGsugx/Olm/4WqHJO3SHiJb9vqMiXSOVEfG4yD0Yy1znTN2q' // password: 123456
  }
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Testando login:', { email, password });
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }
    
    // Buscar usuário
    const user = TEMP_USERS.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    
    console.log('👤 Usuário encontrado:', user.nome);
    console.log('🔐 Hash armazenado:', user.senha);
    console.log('🔑 Senha fornecida:', password);
    
    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.senha);
    
    console.log('✅ Senha válida:', isPasswordValid);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        isAdmin: email === 'alanvitoraraujo1a@outlook.com'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na API de teste:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
