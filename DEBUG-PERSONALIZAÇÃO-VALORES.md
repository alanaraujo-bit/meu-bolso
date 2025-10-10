# 🔧 DEBUG: Personalização de Valores das Parcelas

## 🎯 **Como testar a funcionalidade:**

### **1. Preparação**
```bash
# Certifique-se de que o servidor está rodando
cd "c:\Users\Alan Araújo\meu-bolso"
npm run dev
```

### **2. Acessar a aplicação**
1. Vá para: `http://localhost:3000/dividas`
2. Faça login se necessário
3. Clique em "Ver parcelas" em qualquer dívida
4. Encontre uma parcela com status "PENDENTE"

### **3. Testar a edição**
1. Clique no ícone ✏️ ao lado do valor da parcela
2. Digite um novo valor (ex: 1200)
3. Clique no botão ✓ para salvar
4. Observe o console do navegador (F12) para logs de debug

### **4. Verificar logs**

**No Frontend (Console do navegador):**
```
🔧 Debug Frontend - Iniciando edição: {dividaId: "...", parcelaId: "...", valorAtual: 500}
🔧 Debug - Salvando valor: {dividaId: "...", parcelaId: "...", novoValor: 1200, url: "/api/..."}
🔧 Debug - Response status: 200
🔧 Debug - Response data: {...}
```

**No Backend (Terminal do servidor):**
```
🔧 API Debug - Recebendo requisição PUT para editar valor
🔧 Params: {id: "...", parcelaId: "..."}
🔧 Novo valor recebido: 1200 number
🔧 Buscando dívida: ...
✅ Dívida encontrada: Nome da Dívida
🔧 Buscando parcela: ...
✅ Parcela encontrada - Número: 1 Status: PENDENTE
🔧 Atualizando valor da parcela de 500 para 1200
✅ Parcela atualizada: 1200
```

### **5. Teste alternativo via Console**

Se a interface não estiver funcionando, teste direto via console:

1. Abra o Console do navegador (F12)
2. Cole o conteúdo do arquivo `teste-api-browser.js`
3. Execute: `testarAPIEditarValor()`

### **6. Possíveis problemas e soluções**

#### **Problema: Erro 401 (Não autorizado)**
- **Causa:** Usuário não está logado
- **Solução:** Faça login na aplicação

#### **Problema: Erro 404 (Não encontrado)**
- **Causa:** IDs incorretos ou rota errada
- **Solução:** Verifique se a dívida e parcela existem

#### **Problema: Erro 400 (Valor inválido)**
- **Causa:** Valor zero, negativo ou não numérico
- **Solução:** Use apenas valores positivos

#### **Problema: Interface não responde**
- **Causa:** JavaScript não carregou ou erro de execução
- **Solução:** 
  1. Verifique erros no console
  2. Recarregue a página
  3. Use o teste via console

#### **Problema: Não salva alteração**
- **Causa:** Pode ser erro de rede ou API
- **Solução:**
  1. Verifique logs do servidor
  2. Use teste via console
  3. Verifique conectividade

### **7. Estrutura de URLs da API**

```
PUT /api/dividas/[dividaId]/parcelas/[parcelaId]/valor
```

**Payload:**
```json
{
  "novoValor": 1200
}
```

**Resposta de sucesso:**
```json
{
  "message": "Valor da parcela atualizado com sucesso",
  "parcela": {
    "id": "...",
    "valor": 1200
  },
  "novoValorTotalDivida": 6200
}
```

### **8. Checklist de debug**

- [ ] Servidor está rodando (`npm run dev`)
- [ ] Usuário está logado
- [ ] Parcela tem status PENDENTE
- [ ] Console não mostra erros JavaScript
- [ ] Logs aparecem no terminal do servidor
- [ ] Request chega na API com dados corretos
- [ ] Database é atualizado (verificar via logs)

### **9. Se ainda não funcionar**

1. **Reinicie o servidor:**
   ```bash
   Ctrl+C (para parar)
   npm run dev (para iniciar)
   ```

2. **Limpe o cache do navegador:**
   - Ctrl+Shift+R (hard reload)
   - Ou F12 > Network > Disable cache

3. **Verifique se todas as dependências estão instaladas:**
   ```bash
   npm install
   ```

4. **Execute o teste manual via console** para isolar o problema

---

## 🎯 **Resultado esperado:**

Quando funcionando corretamente:
1. ✅ Interface permite edição inline
2. ✅ Valor é salvo no banco de dados  
3. ✅ Valor total da dívida é recalculado
4. ✅ Interface é atualizada imediatamente
5. ✅ Indicador ✨ aparece para valores personalizados