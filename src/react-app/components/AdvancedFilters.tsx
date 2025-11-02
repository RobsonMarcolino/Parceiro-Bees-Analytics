import { useState } from 'react';
import { Filter, X, Calendar, TrendingDown, AlertTriangle } from 'lucide-react';
import { useData } from '@/react-app/context/DataContext';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdvancedFilters({ isOpen, onClose }: AdvancedFiltersProps) {
  const { processedData, filterDataByWeek } = useData();
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [adherenceThreshold, setAdherenceThreshold] = useState(65);

  const handleApplyFilters = () => {
    filterDataByWeek(selectedWeek);
    onClose();
  };

  const handleClearFilters = () => {
    setSelectedWeek('');
    setSelectedNetwork('');
    setSelectedRegion('');
    setSelectedChannel('');
    setAdherenceThreshold(65);
    filterDataByWeek('');
  };

  const getFilteredStores = () => {
    let stores = processedData.stores;
    
    if (selectedNetwork) {
      stores = stores.filter(store => store.network === selectedNetwork);
    }
    if (selectedRegion) {
      stores = stores.filter(store => store.region === selectedRegion);
    }
    if (selectedChannel) {
      stores = stores.filter(store => store.channel === selectedChannel);
    }
    
    return stores.filter(store => store.adherence < adherenceThreshold);
  };

  const filteredStores = getFilteredStores();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-bees-yellow to-yellow-500 p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6 text-bees-gray-800" />
            <h2 className="text-xl font-bold text-bees-gray-800">Filtros Avançados</h2>
          </div>
          <button
            onClick={onClose}
            className="text-bees-gray-800 hover:bg-yellow-400 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Filtros */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-bees-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Filtros de Tempo e Local
            </h3>

            {/* Semana */}
            <div>
              <label className="block text-sm font-medium text-bees-gray-700 mb-2">
                Semana Nielsen
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full p-3 border border-bees-light-border rounded-lg focus:ring-2 focus:ring-bees-yellow focus:border-transparent"
              >
                <option value="">Todas as semanas</option>
                {processedData.filters.weeks.map((week) => (
                  <option key={week} value={week}>
                    {week}
                  </option>
                ))}
              </select>
            </div>

            {/* Rede */}
            <div>
              <label className="block text-sm font-medium text-bees-gray-700 mb-2">
                Rede
              </label>
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="w-full p-3 border border-bees-light-border rounded-lg focus:ring-2 focus:ring-bees-yellow focus:border-transparent"
              >
                <option value="">Todas as redes</option>
                {processedData.filters.networks.map((network) => (
                  <option key={network} value={network}>
                    {network}
                  </option>
                ))}
              </select>
            </div>

            {/* Região */}
            <div>
              <label className="block text-sm font-medium text-bees-gray-700 mb-2">
                Região
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full p-3 border border-bees-light-border rounded-lg focus:ring-2 focus:ring-bees-yellow focus:border-transparent"
              >
                <option value="">Todas as regiões</option>
                {processedData.filters.regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Canal */}
            <div>
              <label className="block text-sm font-medium text-bees-gray-700 mb-2">
                Canal
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full p-3 border border-bees-light-border rounded-lg focus:ring-2 focus:ring-bees-yellow focus:border-transparent"
              >
                <option value="">Todos os canais</option>
                {processedData.filters.channels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </div>

            {/* Threshold de Aderência */}
            <div>
              <label className="block text-sm font-medium text-bees-gray-700 mb-2">
                Threshold de Aderência: {adherenceThreshold}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={adherenceThreshold}
                onChange={(e) => setAdherenceThreshold(Number(e.target.value))}
                className="w-full h-2 bg-bees-light-border rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-bees-gray-500 mt-1">
                <span>0%</span>
                <span>Meta: 65%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={handleApplyFilters}
                className="flex-1 bg-bees-yellow text-bees-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={handleClearFilters}
                className="flex-1 bg-bees-gray-200 text-bees-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-bees-gray-300 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Resultados dos Filtros */}
          <div>
            <h3 className="text-lg font-semibold text-bees-gray-800 flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5" />
              Lojas Abaixo do Threshold ({adherenceThreshold}%)
            </h3>

            {filteredStores.length === 0 ? (
              <div className="text-center py-8 text-bees-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma loja encontrada com os filtros aplicados</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredStores.slice(0, 50).map((store, index) => (
                  <div
                    key={`${store.network}-${store.store}-${index}`}
                    className="bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-bees-gray-800">
                          {store.network}
                        </div>
                        <div className="text-sm text-bees-gray-600">
                          Loja: {store.store}
                        </div>
                        <div className="text-xs text-bees-gray-500">
                          {store.region} • {store.channel}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          {store.adherence.toFixed(1)}%
                        </div>
                        <div className="text-xs text-bees-gray-500">
                          Gap: -{(adherenceThreshold - store.adherence).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredStores.length > 50 && (
                  <div className="text-center text-bees-gray-500 text-sm">
                    Mostrando 50 de {filteredStores.length} lojas
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdvancedFiltersToggle({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="bg-bees-yellow text-bees-gray-800 px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2 font-semibold"
    >
      <Filter className="w-4 h-4" />
      Filtros Avançados
    </button>
  );
}
