"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import MonitorUsuariosOnline from '@/components/admin/MonitorUsuariosOnline';

export default function UsuariosOnlinePage() {
  return (
    <AdminLayout>
      <MonitorUsuariosOnline />
    </AdminLayout>
  );
}
