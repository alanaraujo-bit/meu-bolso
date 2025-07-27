import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center">
          <span
            className={`text-xs font-medium ${
              trend.isPositive
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 ml-1">vs. mês anterior</span>
        </div>
      )}
    </div>
  );
};

interface QuickStatsProps {
  stats: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalVolume: number;
    activeGoals: number;
  };
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatsCard
        title="Total de Usuários"
        value={formatNumber(stats.totalUsers)}
        icon="👥"
        trend={{
          value: 15.3,
          isPositive: true
        }}
        subtitle="Usuários registrados"
      />
      
      <StatsCard
        title="Usuários Ativos"
        value={formatNumber(stats.activeUsers)}
        icon="🟢"
        trend={{
          value: 8.2,
          isPositive: true
        }}
        subtitle="Últimos 30 dias"
      />
      
      <StatsCard
        title="Novos Usuários"
        value={formatNumber(stats.newUsers)}
        icon="🆕"
        trend={{
          value: 23.1,
          isPositive: true
        }}
        subtitle="Este mês"
      />
      
      <StatsCard
        title="Total de Transações"
        value={formatNumber(stats.totalTransactions)}
        icon="💳"
        trend={{
          value: 12.7,
          isPositive: true
        }}
        subtitle="Todas as transações"
      />
      
      <StatsCard
        title="Volume Financeiro"
        value={formatCurrency(stats.totalVolume)}
        icon="💰"
        trend={{
          value: -2.1,
          isPositive: false
        }}
        subtitle="Volume total movimentado"
      />
      
      <StatsCard
        title="Metas Ativas"
        value={formatNumber(stats.activeGoals)}
        icon="🎯"
        trend={{
          value: 5.8,
          isPositive: true
        }}
        subtitle="Metas em andamento"
      />
    </div>
  );
};
