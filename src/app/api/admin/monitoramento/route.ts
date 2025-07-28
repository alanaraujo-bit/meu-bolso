import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const ADMIN_EMAILS = [
  'alan.araujo7321@gmail.com'
];

// Função para simular métricas do sistema
const generateSystemMetrics = () => {
  const now = new Date();
  
  // Simular métricas realistas do sistema
  const cpuUsage = Math.floor(Math.random() * 40) + 30; // 30-70%
  const memoryUsed = 8 * 1024 * 1024 * 1024 * (0.4 + Math.random() * 0.3); // 40-70% de 8GB
  const memoryTotal = 8 * 1024 * 1024 * 1024; // 8GB
  const memoryPercentage = Math.floor((memoryUsed / memoryTotal) * 100);
  
  const diskUsed = 500 * 1024 * 1024 * 1024 * (0.6 + Math.random() * 0.2); // 60-80% de 500GB
  const diskTotal = 500 * 1024 * 1024 * 1024; // 500GB
  const diskPercentage = Math.floor((diskUsed / diskTotal) * 100);
  
  return {
    cpu: {
      usage: cpuUsage,
      cores: 4,
      temperature: Math.floor(Math.random() * 20) + 45 // 45-65°C
    },
    memory: {
      used: memoryUsed,
      total: memoryTotal,
      percentage: memoryPercentage
    },
    disk: {
      used: diskUsed,
      total: diskTotal,
      percentage: diskPercentage
    },
    network: {
      download: Math.floor(Math.random() * 50000000) + 10000000, // 10-60 MB/s
      upload: Math.floor(Math.random() * 20000000) + 5000000, // 5-25 MB/s
      latency: Math.floor(Math.random() * 50) + 10 // 10-60ms
    },
    database: {
      connections: Math.floor(Math.random() * 30) + 15, // 15-45 conexões
      queryTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
      size: 2.4 * 1024 * 1024 * 1024 // 2.4GB
    },
    requests: {
      total: Math.floor(Math.random() * 1000) + 500, // 500-1500 req/min
      success: 0,
      errors: 0,
      responseTime: Math.floor(Math.random() * 300) + 100 // 100-400ms
    },
    uptime: 1123200, // ~13 dias em segundos
    timestamp: now
  };
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const metrics = generateSystemMetrics();
    
    // Calcular sucessos e erros baseado no total
    metrics.requests.success = Math.floor(metrics.requests.total * 0.95); // 95% de sucesso
    metrics.requests.errors = metrics.requests.total - metrics.requests.success;

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar métricas de monitoramento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
