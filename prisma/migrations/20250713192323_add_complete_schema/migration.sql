/*
  Warnings:

  - Added the required column `atualizadoEm` to the `Transacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transacao" ADD COLUMN     "anexos" TEXT[],
ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tags" TEXT[];
