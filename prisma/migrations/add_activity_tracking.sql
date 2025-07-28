-- Adicionar campos para tracking de atividade online e última atividade
-- Para ser executado no banco MySQL

ALTER TABLE Usuario ADD COLUMN ultimaAtividade DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE Usuario ADD COLUMN statusOnline ENUM('online', 'ausente', 'offline') DEFAULT 'offline';
ALTER TABLE Usuario ADD COLUMN ultimoAcesso DATETIME DEFAULT NULL;
ALTER TABLE Usuario ADD COLUMN tempoSessao INT DEFAULT 0; -- em segundos
ALTER TABLE Usuario ADD COLUMN dispositivoAtual VARCHAR(255) DEFAULT NULL;
ALTER TABLE Usuario ADD COLUMN ipAtual VARCHAR(45) DEFAULT NULL;
