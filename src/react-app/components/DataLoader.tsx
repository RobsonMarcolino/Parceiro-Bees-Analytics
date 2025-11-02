import { useState } from 'react';
import { useData } from '@/react-app/context/DataContext';
import { Upload } from 'lucide-react';

export default function DataLoader() {
  const { loadDataFromSheets, isLoading } = useData();
  const [url, setUrl] = useState(
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR9arc3l-cSWNzjssrAVZ62Ee9BKWAAZWNm27Vxho4eNw7CF_p0dGx6tjJUJQlXZgb1tYRahOZ2UTqi/pub?output=csv'
  );

  const handleLoad = async () => {
    await loadDataFromSheets(url);
  };

  return (
    <div className="bg-bees-light-card border border-bees-light-border rounded-xl p-6 mb-6 shadow-md">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-bees-gray-700 mb-2">
            Link CSV da Planilha
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Cole aqui a URL da planilha Google Sheets publicada como CSV"
            className="w-full px-4 py-3 bg-white border border-bees-light-border rounded-lg text-bees-gray-800 placeholder-bees-gray-400 focus:outline-none focus:ring-2 focus:ring-bees-yellow focus:border-bees-yellow"
            disabled={isLoading}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleLoad}
            disabled={isLoading}
            className="flex items-center gap-2 bg-bees-yellow text-bees-gray-800 px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Upload size={20} />
            {isLoading ? 'Carregando...' : 'Carregar Dados'}
          </button>
        </div>
      </div>
    </div>
  );
}
