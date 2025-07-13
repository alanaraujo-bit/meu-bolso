import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha } = await req.json();

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios." }, { status: 400 });
    }

    if (senha.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }

    // Verifica se o usuário já existe
    const userExists = await prisma.usuario.findUnique({ where: { email } });
    if (userExists) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 400 });
    }

    // Cria o usuário com senha criptografada
    const senhaHash = await hash(senha, 10);
    const user = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
      },
    });

    return NextResponse.json({ 
      message: "Usuário cadastrado com sucesso!",
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}