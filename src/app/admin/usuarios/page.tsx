"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import ListaUsuarios from '@/components/admin/ListaUsuarios';

export default function UsuariosAdminPage() {
  return (
    <AdminLayout>
      <ListaUsuarios />
    </AdminLayout>
  );
}
