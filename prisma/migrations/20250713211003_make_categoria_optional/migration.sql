-- DropForeignKey
ALTER TABLE "Transacao" DROP CONSTRAINT "Transacao_categoriaId_fkey";

-- AlterTable
ALTER TABLE "Transacao" ALTER COLUMN "categoriaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
