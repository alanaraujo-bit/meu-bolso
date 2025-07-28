# Sistema de Branding - Meu Bolso

Este diretório contém todos os componentes relacionados à identidade visual da aplicação "Meu Bolso".

## Componentes

### Logo.tsx
Componente principal da logo com texto opcional.
- **Props**: `size`, `className`, `showText`
- **Uso**: Navegação, páginas de login, headers

```tsx
import Logo from '@/components/branding/Logo';

// Logo completa com texto
<Logo size="lg" />

// Apenas o símbolo
<Logo size="md" showText={false} />
```

### LogoMark.tsx
Versão apenas do símbolo da marca (letra M).
- **Props**: `size`, `className`
- **Uso**: Favicons, elementos pequenos, carregamento

```tsx
import LogoMark from '@/components/branding/LogoMark';

<LogoMark size="sm" />
```

### Branding.tsx
Componente unificado para todas as variações da marca.
- **Props**: `variant`, `size`, `className`, `showText`
- **Variantes**: `full`, `mark`, `text`

```tsx
import Branding from '@/components/branding/Branding';

// Logo completa
<Branding variant="full" size="lg" />

// Apenas símbolo
<Branding variant="mark" size="md" />

// Apenas texto
<Branding variant="text" size="lg" />
```

## Tamanhos Disponíveis
- `xs`: 24px (w-6 h-6)
- `sm`: 32px (w-8 h-8)
- `md`: 40px (w-10 h-10)
- `lg`: 48px (w-12 h-12)
- `xl`: 64px (w-16 h-16)

## Cores da Marca

### Cores Principais
- **Teal**: #14b8a6
- **Cyan**: #0891b2

### Cores de Destaque
- **Laranja**: #f97316
- **Azul**: #3b82f6

### Gradientes
- **Primário**: `from-teal-500 to-cyan-600`
- **Hover**: `from-teal-600 to-cyan-700`
- **Texto**: `from-teal-500 to-cyan-600`

## Estrutura Visual

A logo consiste em:
1. **Letra M**: Forma principal em gradiente teal/cyan
2. **Barra Laranja**: Elemento de destaque (#f97316)
3. **Barra Azul**: Elemento complementar (#3b82f6)
4. **Texto**: "Meu Bolso" em gradiente matching

## Guidelines de Uso

### ✅ Faça
- Use tamanhos apropriados para o contexto
- Mantenha as cores originais
- Use espaçamento adequado ao redor da logo
- Prefira fundos claros para melhor contraste

### ❌ Não Faça
- Não altere as cores da marca
- Não distorça as proporções
- Não use em fundos muito coloridos
- Não remova elementos da logo

## Implementação

Todos os componentes já estão integrados em:
- Navbar principal
- Páginas de login/cadastro
- Páginas de erro (404, 500)
- Página de carregamento
- Admin pages
- Favicon do site

Para adicionar em novos locais, importe do index:

```tsx
import { Logo, LogoMark, Branding } from '@/components/branding';
```
