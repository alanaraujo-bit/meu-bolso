-- Script SQL para aplicar correções no Railway
-- Execute este script diretamente no console do Railway

-- 1. Adicionar campo isAdmin ao Usuario
ALTER TABLE Usuario ADD COLUMN isAdmin BOOLEAN DEFAULT false NOT NULL;

-- 2. Corrigir enum Frequencia (MySQL não suporta ALTER diretamente para ENUMs)
-- Vamos criar uma nova tabela temporária com o enum correto

-- Primeiro, verificar se há dados que usam frequências antigas
SELECT DISTINCT frequencia FROM TransacaoRecorrente;

-- Se houver dados com frequências antigas, mapeá-los:
-- diario -> diaria
UPDATE TransacaoRecorrente SET frequencia = 'diaria' WHERE frequencia = 'diario';

-- Agora alterar o enum (isso pode requerer recriar a coluna)
-- Método 1: Adicionar nova coluna temporária
ALTER TABLE TransacaoRecorrente ADD COLUMN nova_frequencia ENUM('diaria', 'semanal', 'quinzenal', 'mensal', 'trimestral', 'semestral', 'anual') NOT NULL DEFAULT 'mensal';

-- Copiar dados
UPDATE TransacaoRecorrente SET nova_frequencia = 
  CASE frequencia
    WHEN 'diario' THEN 'diaria'
    WHEN 'semanal' THEN 'semanal'
    WHEN 'mensal' THEN 'mensal'
    WHEN 'anual' THEN 'anual'
    ELSE 'mensal'
  END;

-- Remover coluna antiga e renomear nova
ALTER TABLE TransacaoRecorrente DROP COLUMN frequencia;
ALTER TABLE TransacaoRecorrente CHANGE nova_frequencia frequencia ENUM('diaria', 'semanal', 'quinzenal', 'mensal', 'trimestral', 'semestral', 'anual') NOT NULL;

-- 3. Verificar se as alterações funcionaram
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  COLUMN_DEFAULT,
  IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'railway' 
  AND TABLE_NAME = 'Usuario' 
  AND COLUMN_NAME = 'isAdmin';

SELECT 
  COLUMN_NAME,
  COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'railway' 
  AND TABLE_NAME = 'TransacaoRecorrente' 
  AND COLUMN_NAME = 'frequencia';