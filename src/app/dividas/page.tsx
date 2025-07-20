"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MoneyLoading from "@/components/MoneyLoading";
import StatusBadge from "@/components/StatusBadge";

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
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Aba de Dívidas em desenvolvimento</h1>
      <p>Esta funcionalidade está temporariamente desabilitada.</p>
    </div>
  );
}
