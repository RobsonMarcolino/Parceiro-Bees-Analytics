import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Beer, BarChart3, Store, List } from 'lucide-react';
import ChatBot, { ChatBotToggle } from '@/react-app/components/ChatBot';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const tabs = [
    { name: 'Início', path: '/', icon: Beer },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Visão Loja', path: '/loja', icon: Store },
    { name: 'Detalhes', path: '/detalhes', icon: List },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-bees-light-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <img
                src="https://media3.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZHJ1eGZkaHRuM2cyZ3FrOW40eG92MWExNGNncDl3bDl6dWs3Z3BxNyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/4NCmkwMuPoJSBzyIt8/giphy.webp"
                alt="Logo"
                className="w-10 h-10"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-bees-gray-800">
                Aderência ao Calendário
              </h1>
            </div>

            <nav className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path;
                return (
                  <button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      isActive
                        ? 'bg-bees-yellow text-bees-gray-800 shadow-md'
                        : 'text-bees-gray-600 hover:bg-bees-light-hover hover:text-bees-gray-800'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="bg-bees-light-card border-t border-bees-light-border mt-20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-bees-gray-500 text-sm">
            <div>Off Trade Ambev - Aderência ao Calendário de Cerveja</div>
            <div>© 2024 - Todos os direitos reservados</div>
          </div>
        </div>
      </footer>

      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <ChatBotToggle onOpen={() => setIsChatOpen(true)} />
    </div>
  );
}
