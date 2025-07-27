import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Testando login:', { email, password });
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }
    
    // Buscar usuário no banco de dados real
    const user = await prisma.usuario.findUnique({
      where: { email }
    });
    
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
