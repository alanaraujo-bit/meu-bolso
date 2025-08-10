-- Aumentar tamanho da coluna avatarUrl para suportar strings base64
ALTER TABLE `Usuario` MODIFY `avatarUrl` TEXT;
