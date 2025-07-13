"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!session) return null;

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Transações", href: "/transacoes", icon: "💳" },
    { name: "Recorrentes", href: "/recorrentes", icon: "🔄" },
    { name: "Metas", href: "/metas", icon: "🎯" },
    { name: "Categorias", href: "/categorias", icon: "🏷️" },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <span className="text-2xl">💰</span>
            <span className="text-xl font-bold text-gray-900">Meu Bolso</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Olá, {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Sair
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 px-3 py-2">
                  {session.user?.name || session.user?.email}
                </p>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}