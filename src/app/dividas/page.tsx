"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MoneyLoading from "@/components/MoneyLoading";
import StatusBadge from "@/components/StatusBadge";
import HelpButton from "@/components/HelpButton";
import { helpContents } from "@/lib/helpContents";

interface ParcelaDivida {
  id: string;
  numero: number;
  valor: number;
  dataVencimento: string;
  status: "PAGA" | "PENDENTE" | "VENCIDA";
}

interface Categoria {
  id: string;
  nome: string;
  cor?: string;
}

interface Divida {
  id: string;
  nome: string;
  valorTotal: number;
  numeroParcelas: number;
  valorParcela: number;
  dataPrimeiraParcela: string;
  status: "ATIVA" | "QUITADA";
  categoria?: Categoria | null;
  parcelas: ParcelaDivida[];
}

export default function DividasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <MoneyLoading text="Carregando..." />;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              💳 Controle de Dívidas
            </h1>
            <HelpButton 
              title="Como controlar suas dívidas"
              steps={helpContents.dividas}
              size="md"
              variant="inline"
            />
          </div>
          <p className="text-gray-600">
            Organize e controle suas dívidas de forma estratégica
          </p>
        </div>

        {/* Card de Em Desenvolvimento */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-orange-200">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Funcionalidade em Desenvolvimento
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Esta seção está sendo construída para te ajudar a ter controle total sobre suas dívidas. 
              Em breve você poderá cadastrar, acompanhar e criar estratégias para quitação de todas suas dívidas.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg text-left mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">
                O que estará disponível em breve:
              </h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Cadastro completo de dívidas com juros e parcelas</li>
                <li>• Estratégias de quitação (Avalanche e Bola de Neve)</li>
                <li>• Simulador de pagamentos antecipados</li>
                <li>• Alertas de vencimento</li>
                <li>• Gráficos de evolução da redução das dívidas</li>
                <li>• Calculadora de negociação</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/transacoes')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Gerenciar Transações
              </button>
              <button
                onClick={() => router.push('/metas')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Criar Metas de Quitação
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
