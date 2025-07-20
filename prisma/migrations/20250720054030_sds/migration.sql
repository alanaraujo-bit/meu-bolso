-- CreateTable
CREATE TABLE `Usuario` (
    `id` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cor` VARCHAR(191) NULL,
    `icone` VARCHAR(191) NULL,
    `tipo` ENUM('receita', 'despesa', 'ambos') NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Categoria_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transacao` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `categoriaId` VARCHAR(191) NULL,
    `tipo` ENUM('receita', 'despesa') NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `data` DATETIME(3) NOT NULL,
    `isRecorrente` BOOLEAN NOT NULL DEFAULT false,
    `recorrenteId` VARCHAR(191) NULL,
    `metaId` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `Transacao_categoriaId_fkey`(`categoriaId`),
    INDEX `Transacao_metaId_fkey`(`metaId`),
    INDEX `Transacao_recorrenteId_fkey`(`recorrenteId`),
    INDEX `Transacao_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransacaoRecorrente` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `categoriaId` VARCHAR(191) NOT NULL,
    `tipo` ENUM('receita', 'despesa') NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `frequencia` ENUM('diario', 'semanal', 'mensal', 'anual') NOT NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TransacaoRecorrente_categoriaId_fkey`(`categoriaId`),
    INDEX `TransacaoRecorrente_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Meta` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `valorAlvo` DECIMAL(10, 2) NOT NULL,
    `currentAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `dataAlvo` DATETIME(3) NOT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Meta_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `transacaoId` VARCHAR(191) NOT NULL,

    INDEX `Tag_transacaoId_fkey`(`transacaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Anexo` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `transacaoId` VARCHAR(191) NOT NULL,

    INDEX `Anexo_transacaoId_fkey`(`transacaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Divida` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `valorTotal` DECIMAL(10, 2) NOT NULL,
    `numeroParcelas` INTEGER NOT NULL,
    `valorParcela` DECIMAL(10, 2) NOT NULL,
    `dataPrimeiraParcela` DATETIME(3) NOT NULL,
    `categoriaId` VARCHAR(191) NULL,
    `status` ENUM('ATIVA', 'QUITADA') NOT NULL DEFAULT 'ATIVA',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `Divida_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParcelaDivida` (
    `id` VARCHAR(191) NOT NULL,
    `dividaId` VARCHAR(191) NOT NULL,
    `numero` INTEGER NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `dataVencimento` DATETIME(3) NOT NULL,
    `status` ENUM('PAGA', 'PENDENTE', 'VENCIDA') NOT NULL DEFAULT 'PENDENTE',
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `ParcelaDivida_dividaId_fkey`(`dividaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Categoria` ADD CONSTRAINT `Categoria_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transacao` ADD CONSTRAINT `Transacao_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transacao` ADD CONSTRAINT `Transacao_metaId_fkey` FOREIGN KEY (`metaId`) REFERENCES `Meta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transacao` ADD CONSTRAINT `Transacao_recorrenteId_fkey` FOREIGN KEY (`recorrenteId`) REFERENCES `TransacaoRecorrente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transacao` ADD CONSTRAINT `Transacao_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransacaoRecorrente` ADD CONSTRAINT `TransacaoRecorrente_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransacaoRecorrente` ADD CONSTRAINT `TransacaoRecorrente_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meta` ADD CONSTRAINT `Meta_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_transacaoId_fkey` FOREIGN KEY (`transacaoId`) REFERENCES `Transacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Anexo` ADD CONSTRAINT `Anexo_transacaoId_fkey` FOREIGN KEY (`transacaoId`) REFERENCES `Transacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Divida` ADD CONSTRAINT `Divida_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Divida` ADD CONSTRAINT `Divida_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParcelaDivida` ADD CONSTRAINT `ParcelaDivida_dividaId_fkey` FOREIGN KEY (`dividaId`) REFERENCES `Divida`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
