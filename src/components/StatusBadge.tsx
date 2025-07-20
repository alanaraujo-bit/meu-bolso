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
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status] || "bg-gray-400";

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white ${colorClass}`}>      
      <span className={`w-2 h-2 mr-2 rounded-full ${colorClass}`}></span>
      {status}
    </span>
  );
}
