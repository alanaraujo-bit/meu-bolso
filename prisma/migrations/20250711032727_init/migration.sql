-- CreateEnum
CREATE TYPE "CategoriaTipo" AS ENUM ('receita', 'despesa', 'ambos');

-- CreateEnum
CREATE TYPE "TransacaoTipo" AS ENUM ('receita', 'despesa');

-- CreateEnum
CREATE TYPE "Frequencia" AS ENUM ('diario', 'semanal', 'mensal', 'anual');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT,
    "avatarUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT,
    "icone" TEXT,
    "tipo" "CategoriaTipo" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transacao" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "tipo" "TransacaoTipo" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "isRecorrente" BOOLEAN NOT NULL DEFAULT false,
    "recorrenteId" TEXT,
    "metaId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransacaoRecorrente" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "tipo" "TransacaoTipo" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" TEXT,
    "frequencia" "Frequencia" NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransacaoRecorrente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meta" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valorAlvo" DECIMAL(10,2) NOT NULL,
    "currentAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "dataAlvo" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_recorrenteId_fkey" FOREIGN KEY ("recorrenteId") REFERENCES "TransacaoRecorrente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "Meta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransacaoRecorrente" ADD CONSTRAINT "TransacaoRecorrente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransacaoRecorrente" ADD CONSTRAINT "TransacaoRecorrente_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meta" ADD CONSTRAINT "Meta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
