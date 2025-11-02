import { useState, useMemo } from 'react';
import { useData } from '@/react-app/context/DataContext';
import { Download, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const META = 65.0;

export default function Detalhes() {
  const { processedData } = useData();
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredDetails = useMemo(() => {
    return processedData.stores.filter((store) => {
      return (
        (selectedNetwork === '' || store.network === selectedNetwork) &&
        (selectedRegion === '' || store.region === selectedRegion) &&
        (selectedChannel === '' || store.channel === selectedChannel) &&
        (selectedProduct === '' || store.product === selectedProduct) &&
        (selectedWeek === '' || store.weekStart === selectedWeek)
      );
    });
  }, [processedData.stores, selectedNetwork, selectedRegion, selectedChannel, selectedProduct, selectedWeek]);

  const totalPages = Math.ceil(filteredDetails.length / itemsPerPage);
  const currentItems = filteredDetails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      filteredDetails.map((store) => ({
        Rede: store.network,
        'CNPJ (Loja)': store.store,
        Produto: store.product,
        'TTC OK': store.ttcOk,
        'TTC Abaixo': store.ttcBelow,
        'TTC Acima': store.ttcAbove,
        'Aderência (%)': store.adherence.toFixed(1),
        Região: store.region,
        Canal: store.channel,
        'Data Início': store.weekStart,
        'Data Fim': store.weekEnd,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Detalhes Aderência');
    XLSX.writeFile(wb, 'Detalhes_Aderencia_Lojas.xlsx');
  };

  const getStatusIcon = (adherence: number) => {
    if (adherence >= META) return <CheckCircle className="w-4 h-4 text-success" />;
    if (adherence < META - 15) return <XCircle className="w-4 h-4 text-danger" />;
    return <MinusCircle className="w-4 h-4 text-warning" />;
  };

  const getStatusClass = (adherence: number) => {
    if (adherence >= META) return 'text-success';
    if (adherence < META - 15) return 'text-danger';
    return 'text-warning';
  };

  if (processedData.stores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-bees-gray-500">Carregue os dados primeiro no Dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-bees-light-card border border-bees-light-border rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-bees-gray-800">Detalhes por Rede e Loja</h2>
          <button
            onClick={handleExport}
            disabled={filteredDetails.length === 0}
            className="flex items-center gap-2 bg-bees-yellow text-bees-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Exportar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-bees-gray-700 mb-2">
              Filtrar por Rede
            </label>
            <select
              value={selectedNetwork}
              onChange={(e) => {
                setSelectedNetwork(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-bees-light-border rounded-lg text-bees-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-bees-yellow focus:border-bees-yellow"
            >
              <option value="">Todas as redes</option>
              {processedData.filters.networks.map((network) => (
                <option key={network} value={network}>
                  {network}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-bees-gray-700 mb-2">
              Filtrar por Região
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-bees-light-border rounded-lg text-bees-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-bees-yellow focus:border-bees-yellow"
            >
              <option value="">Todas as regiões</option>
              {processedData.filters.regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-bees-gray-700 mb-2">
              Filtrar por Canal
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => {
                setSelectedChannel(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-bees-light-border rounded-lg text-bees-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-bees-yellow focus:border-bees-yellow"
            >
              <option value="">Todos os canais</option>
              {processedData.filters.channels.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-bees-gray-700 mb-2">
              Filtrar por Produto
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-bees-light-border rounded-lg text-bees-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-bees-yellow focus:border-bees-yellow"
            >
              <option value="">Todos os produtos</option>
              {processedData.filters.products.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-bees-gray-700 mb-2">
              Semana (Nielsen)
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => {
                setSelectedWeek(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white border border-bees-light-border rounded-lg text-bees-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-bees-yellow focus:border-bees-yellow"
            >
              <option value="">Todas as semanas</option>
              {processedData.filters.weeks.map((week) => (
                <option key={week} value={week}>
                  {week}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-bees-light-card border border-bees-light-border rounded-xl p-6 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bees-light-border">
                <th className="text-left py-3 px-3 text-bees-gray-800 font-semibold text-sm">Rede</th>
                <th className="text-left py-3 px-3 text-bees-gray-800 font-semibold text-sm">CNPJ (Loja)</th>
                <th className="text-left py-3 px-3 text-bees-gray-800 font-semibold text-sm">Produto</th>
                <th className="text-left py-3 px-3 text-bees-gray-800 font-semibold text-sm">TTC OK</th>
                <th className="text-left py-3 px-3 text-bees-gray-800 font-semibold text-sm">TTC Abaixo</th>
                <th className="text-left py-3 px-3 text-bees-gray-800 font-semibold text-sm">TTC Acima</th>
                <th className="text-left py-3 px-3 text-bees-gray-800 font-semibold text-sm">Aderência</th>
                <th className="text-left py-3 px-3 text-bees-gray-800 font-semibold text-sm">Região</th>
                <th className="text-left py-3 px-3 text-bees-gray-800 font-semibold text-sm">Canal</th>
                <th className="text-left py-3 px-3 text-bees-gray-800 font-semibold text-sm">Data Início</th>
                <th className="text-left py-3 px-3 text-bees-gray-800 font-semibold text-sm">Data Fim</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((store, index) => (
                <tr key={index} className="border-b border-bees-light-border hover:bg-bees-light-hover transition-colors">
                  <td className="py-3 px-3 text-bees-gray-600 text-sm">{store.network}</td>
                  <td className="py-3 px-3 text-bees-gray-600 text-sm font-mono">{store.store}</td>
                  <td className="py-3 px-3 text-bees-gray-600 text-sm max-w-[150px] truncate" title={store.product}>
                    {store.product}
                  </td>
                  <td className="py-3 px-3 text-bees-gray-600 text-sm">{store.ttcOk}</td>
                  <td className="py-3 px-3 text-bees-gray-600 text-sm">{store.ttcBelow}</td>
                  <td className="py-3 px-3 text-bees-gray-600 text-sm">{store.ttcAbove}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(store.adherence)}
                      <span className={`font-bold text-sm ${getStatusClass(store.adherence)}`}>
                        {store.adherence.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-bees-gray-600 text-sm">{store.region}</td>
                  <td className="py-3 px-3 text-bees-gray-600 text-sm">{store.channel}</td>
                  <td className="py-3 px-3 text-bees-gray-600 text-sm">{store.weekStart}</td>
                  <td className="py-3 px-3 text-bees-gray-600 text-sm">{store.weekEnd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-bees-light-border text-bees-gray-600 rounded-lg hover:bg-bees-light-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentPage === page
                      ? 'bg-bees-yellow text-bees-gray-800'
                      : 'bg-white border border-bees-light-border text-bees-gray-600 hover:bg-bees-light-hover'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {totalPages > 5 && <span className="text-bees-gray-500">...</span>}

            {totalPages > 5 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  currentPage === totalPages
                    ? 'bg-bees-yellow text-bees-gray-800'
                    : 'bg-white border border-bees-light-border text-bees-gray-600 hover:bg-bees-light-hover'
                }`}
              >
                {totalPages}
              </button>
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-bees-light-border text-bees-gray-600 rounded-lg hover:bg-bees-light-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        )}

        <div className="text-center text-bees-gray-500 text-sm mt-4">
          Mostrando {currentItems.length} de {filteredDetails.length} registros
        </div>
      </div>
    </div>
  );
}
