"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "./branding/Logo";

// Lista de emails de administradores
const ADMIN_EMAILS = [
  'alanvitoraraujo1a@outlook.com', // Substitua pelo seu email
  'admin@meubolso.com',
  // Adicione outros emails de admin aqui
];

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Hook para apenas escutar mudanças de tema (não controlar)
  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      setDarkMode(savedTheme === 'dark');
    };

    // Configurar tema inicial
    updateTheme();

    // Escutar mudanças no localStorage
    window.addEventListener('storage', updateTheme);
    
    // Também escutar mudanças diretas na classe do documento
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      window.removeEventListener('storage', updateTheme);
      observer.disconnect();
    };
  }, []);

  if (!session) return null;

  const isAdmin = session.user?.email && ADMIN_EMAILS.includes(session.user.email);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Transações", href: "/transacoes", icon: "💳" },
    { name: "Recorrentes", href: "/recorrentes", icon: "🔄" },
    { name: "Metas", href: "/metas", icon: "🎯" },
    { name: "Categorias", href: "/categorias", icon: "🏷️" },
    { name: "Dívidas", href: "/dividas", icon: "👛" },
    { name: "Perfil", href: "/perfil", icon: "👤" },
    ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: "🛡️" }] : []),
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className={`shadow-lg border-b transition-all duration-300 ${
      darkMode 
        ? 'bg-slate-900/95 border-slate-700 backdrop-blur-sm' 
        : 'bg-white/95 border-gray-200 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Logo size="sm" showText={false} animated />
            <span className={`text-xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Meu Bolso</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  pathname === item.href
                    ? darkMode
                      ? "bg-emerald-900/50 text-emerald-300 shadow-md"
                      : "bg-emerald-100 text-emerald-700 shadow-md"
                    : darkMode
                      ? "text-gray-300 hover:text-white hover:bg-slate-700/50"
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
            <span className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Olá, {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                darkMode
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
              }`}
            >
              Sair
            </button>
          </div>

          {/* Mobile menu button - Com espaço para não ser sobreposto */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg transition-all duration-300 mr-12 ${
                darkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-slate-700/50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
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
          <div className={`md:hidden py-4 border-t transition-all duration-300 ${
            darkMode ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <div className="space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    pathname === item.href
                      ? darkMode
                        ? "bg-emerald-900/50 text-emerald-300"
                        : "bg-emerald-100 text-emerald-700"
                      : darkMode
                        ? "text-gray-300 hover:text-white hover:bg-slate-700/50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
              <div className={`pt-4 border-t transition-colors duration-300 ${
                darkMode ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <p className={`text-sm px-3 py-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {session.user?.name || session.user?.email}
                </p>
                <button
                  onClick={handleSignOut}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    darkMode
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
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