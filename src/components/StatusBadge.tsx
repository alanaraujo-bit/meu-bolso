// src/components/StatusBadge.tsx

import React from "react";

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  ATIVA: "bg-green-500",
  QUITADA: "bg-gray-500",
  PAGA: "bg-green-500",
  PENDENTE: "bg-yellow-500",
  VENCIDA: "bg-red-500",
  // Status em inglês para compatibilidade
  pending: "bg-yellow-500",
  completed: "bg-green-500",
  error: "bg-red-500",
};

const statusTexts: Record<string, string> = {
  ATIVA: "Ativa",
  QUITADA: "Quitada",
  PAGA: "Paga",
  PENDENTE: "Pendente",
  VENCIDA: "Vencida",
  // Traduções dos status em inglês
  pending: "Pendente",
  completed: "Paga",
  error: "Vencida",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status] || "bg-gray-400";
  const displayText = statusTexts[status] || status;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white ${colorClass}`}>      
      <span className={`w-2 h-2 mr-2 rounded-full ${colorClass}`}></span>
      {displayText}
    </span>
  );
}
