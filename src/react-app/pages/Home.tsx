import { useNavigate } from 'react-router';
import { TrendingUp } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center animate-fade-in">
        <div className="mb-8">
          <img
            src="https://media4.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cHByZnB0MnZ1YmV5d2Q2ZTdlOGJoNzJnbXZxaGdmanVuczRnNHU5eiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/fZ3r1qdfc0msS9aRgA/giphy.webp"
            alt="Analytics"
            className="w-64 h-64 mx-auto mb-6 opacity-90"
          />
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-bees-gray-800 mb-4">
          Assistente de Aderência
        </h1>

        <p className="text-xl text-bees-gray-600 mb-8 max-w-2xl mx-auto">
          Carregue sua planilha e obtenha insights em tempo real sobre a aderência ao calendário de cerveja.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 bg-bees-yellow text-bees-gray-800 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-lg"
        >
          <TrendingUp size={24} />
          Ver Dashboard
        </button>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-bees-light-card border border-bees-light-border rounded-lg p-6 shadow-md">
            <div className="text-bees-yellow text-3xl font-bold mb-2">65%</div>
            <div className="text-bees-gray-600">Meta de Aderência</div>
          </div>
          <div className="bg-bees-light-card border border-bees-light-border rounded-lg p-6 shadow-md">
            <div className="text-bees-yellow text-3xl font-bold mb-2">Real-time</div>
            <div className="text-bees-gray-600">Análise Instantânea</div>
          </div>
          <div className="bg-bees-light-card border border-bees-light-border rounded-lg p-6 shadow-md">
            <div className="text-bees-yellow text-3xl font-bold mb-2">AI</div>
            <div className="text-bees-gray-600">Insights Inteligentes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
