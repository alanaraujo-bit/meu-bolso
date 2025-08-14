/**
 * Utilitários para formatação responsiva de valores monetários
 */

/**
 * Formatar valor monetário no formato brasileiro
 */
export const formatarValor = (valor: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
};

/**
 * Formatar valor de forma compacta para espaços pequenos
 * Valores >= 1M: R$ 1.2M
 * Valores >= 1K: R$ 123k
 * Valores < 1K: R$ 999,00
 */
export const formatarValorCompacto = (valor: number): string => {
  const abs = Math.abs(valor);
  const sinal = valor < 0 ? '-' : '';
  
  if (abs >= 1000000) {
    return `${sinal}R$ ${(abs / 1000000).toFixed(1)}M`;
  } else if (abs >= 1000) {
    return `${sinal}R$ ${(abs / 1000).toFixed(0)}k`;
  }
  return formatarValor(valor);
};

/**
 * Componente para exibir valor responsivo
 * Mostra valor completo em telas maiores e compacto em telas menores
 */
interface ValorResponsivoProps {
  valor: number;
  className?: string;
  showCompactAlways?: boolean; // Sempre mostrar formato compacto
}

export const ValorResponsivo: React.FC<ValorResponsivoProps> = ({ 
  valor, 
  className = "", 
  showCompactAlways = false 
}) => {
  if (showCompactAlways) {
    return (
      <span className={className}>
        {formatarValorCompacto(valor)}
      </span>
    );
  }

  return (
    <>
      <span className={`hidden sm:inline ${className}`}>
        {formatarValor(valor)}
      </span>
      <span className={`sm:hidden ${className}`}>
        {formatarValorCompacto(valor)}
      </span>
    </>
  );
};

/**
 * Formatar porcentagem
 */
export const formatarPorcentagem = (valor: number, decimais: number = 1): string => {
  return `${valor.toFixed(decimais)}%`;
};

/**
 * Formatar número para display compacto
 */
export const formatarNumeroCompacto = (valor: number): string => {
  const abs = Math.abs(valor);
  const sinal = valor < 0 ? '-' : '';
  
  if (abs >= 1000000) {
    return `${sinal}${(abs / 1000000).toFixed(1)}M`;
  } else if (abs >= 1000) {
    return `${sinal}${(abs / 1000).toFixed(0)}k`;
  }
  return valor.toString();
};

/**
 * Auto-detectar se um valor precisa ser compactado baseado no comprimento
 */
export const formatarValorInteligente = (valor: number, maxLength: number = 10): string => {
  const valorCompleto = formatarValor(valor);
  
  if (valorCompleto.length <= maxLength) {
    return valorCompleto;
  }
  
  return formatarValorCompacto(valor);
};
