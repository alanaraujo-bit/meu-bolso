"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import DashboardAvancado from '@/components/admin/DashboardAvancado';

export default function AdminAnalytics() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">📊 Analytics Avançado</h1>
          <p className="text-gray-600">Análises detalhadas e métricas avançadas do sistema</p>
        </div>

        {/* Dashboard Avançado sem o layout próprio */}
        <div className="space-y-6">
          <DashboardAvancado />
        </div>
      </div>
    </AdminLayout>
  );
}
