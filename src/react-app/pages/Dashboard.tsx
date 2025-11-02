import { useState } from 'react';
import { useData } from '@/react-app/context/DataContext';
import { useNavigate } from 'react-router';
import DataLoader from '@/react-app/components/DataLoader';
import GaugeChart from '@/react-app/components/GaugeChart';
import AdvancedFilters, { AdvancedFiltersToggle } from '@/react-app/components/AdvancedFilters';
import AlertsPanel, { AlertsToggle } from '@/react-app/components/AlertsPanel';
import { Rocket, Lightbulb, CheckCircle, XCircle, MinusCircle, Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const META = 65.0;

export default function Dashboard() {
  const { processedData, isLoading, filterDataByWeek } = useData();
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const handleWeekChange = (week: string) => {
    setSelectedWeek(week);
    filterDataByWeek(week);
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      processedData.networks.map((net) => ({
        Rede: net.name,
        'Aderência (%)': net.adherence.toFixed(1),
        'Peso (%)': net.weight.toFixed(1),
        'Qtd Lojas': net.stores,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Visão Geral Redes');
    XLSX.writeFile(wb, 'Dashboard_Aderencia_Redes.xlsx');
  };

  const top5ByWeight = [...processedData.networks].sort((a, b) => b.weight - a.weight).slice(0, 5);
  const destaquesPositivos = [...top5ByWeight].sort((a, b) => b.adherence - a.adherence).slice(0, 3);
  const destaquesNegativos = [...top5ByWeight].sort((a, b) => a.adherence - b.adherence).slice(0, 3);

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

  if (isLoading) {
    return (
      <div>
        <DataLoader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-bees-yellow animate-spin mx-auto mb-4" />
            <p className="text-bees-gray-600">Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DataLoader />
      
      {/* Header with Action Buttons */}
      {processedData.networks.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-bees-light-card border border-bees-light-border rounded-xl p-6 shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-bees-gray-800 mb-2">
              Dashboard de Aderência
            </h1>
            <p className="text-bees-gray-600">
              Visão geral da performance das redes e lojas
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <AdvancedFiltersToggle onOpen={() => setIsFiltersOpen(true)} />
            <AlertsToggle onOpen={() => setIsAlertsOpen(true)} />
            <button
              onClick={handleExport}
              className="bg-bees-gray-600 text-white px-4 py-2 rounded-lg hover:bg-bees-gray-700 transition-colors flex items-center gap-2 font-semibold"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      )}

      {processedData.networks.length > 0 && (
        <>
          <div className="bg-bees-light-card border border-bees-light-border rounded-xl p-6 shadow-md">
            <label className="block text-sm font-medium text-bees-gray-700 mb-2">
              Filtrar Dashboard por Semana
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => handleWeekChange(e.target.value)}
              className="w-full sm:w-64 px-4 py-3 bg-white border border-bees-light-border rounded-lg text-bees-gray-800 focus:outline-none focus:ring-2 focus:ring-bees-yellow focus:border-bees-yellow"
            >
              <option value="">Todas as semanas (Geral)</option>
              {processedData.filters.weeks.map((week) => (
                <option key={week} value={week}>
                  {week}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gauge Card */}
            <div className="bg-bees-light-card border border-bees-light-border rounded-xl p-6 animate-slide-up shadow-md">
              <h2 className="text-lg font-bold text-bees-gray-800 mb-4 flex items-center gap-2">
                Aderência Total
              </h2>
              <div className="text-center">
                <h3 className="text-2xl font-extrabold text-bees-gray-700 text-3d mb-4">GEO MG</h3>
                <GaugeChart value={processedData.totalAdherence} meta={META} />
                <div className="text-5xl font-bold text-bees-gray-800 my-4">
                  {processedData.totalAdherence.toFixed(1)}%
                </div>
                <div className="text-bees-gray-500 text-sm">Meta: {META}%</div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-bees-light-card border border-bees-light-border rounded-xl p-6 animate-slide-up shadow-md" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-lg font-bold text-success mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Maiores Impulsionadores
              </h2>
              <div className="space-y-3">
                {destaquesPositivos.map((net, index) => (
                  <div key={net.name} className="flex items-center justify-between py-3 px-4 bg-green-50 rounded-lg border-l-4 border-success">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-bees-gray-800 text-lg">{index + 1}º</span>
                      <span className="text-bees-gray-800 font-semibold truncate">{net.name}</span>
                    </div>
                    <span className="text-success font-bold text-lg">{net.adherence.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Performers */}
            <div className="bg-bees-light-card border border-bees-light-border rounded-xl p-6 animate-slide-up shadow-md" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-lg font-bold text-danger mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Maiores Oportunidades
              </h2>
              <div className="space-y-3">
                {destaquesNegativos.map((net, index) => (
                  <div key={net.name} className="flex items-center justify-between py-3 px-4 bg-red-50 rounded-lg border-l-4 border-danger">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-bees-gray-800 text-lg">{index + 1}º</span>
                      <span className="text-bees-gray-800 font-semibold truncate">{net.name}</span>
                    </div>
                    <span className="text-danger font-bold text-lg">{net.adherence.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Networks Table */}
          <div className="bg-bees-light-card border border-bees-light-border rounded-xl p-6 animate-slide-up shadow-md" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-bees-gray-800">Visão Geral das Redes</h2>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-bees-yellow text-bees-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-all shadow-md"
              >
                <Download size={18} />
                Exportar
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-bees-light-border">
                    <th className="text-left py-3 px-4 text-bees-gray-800 font-semibold">Rede</th>
                    <th className="text-left py-3 px-4 text-bees-gray-800 font-semibold">Aderência</th>
                    <th className="text-left py-3 px-4 text-bees-gray-800 font-semibold">Peso</th>
                    <th className="text-left py-3 px-4 text-bees-gray-800 font-semibold">Lojas</th>
                    <th className="text-left py-3 px-4 text-bees-gray-800 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.networks
                    .sort((a, b) => b.weight - a.weight)
                    .map((network) => (
                      <tr
                        key={network.name}
                        onClick={() => navigate('/detalhes')}
                        className="border-b border-bees-light-border hover:bg-bees-light-hover cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 text-bees-gray-800 font-medium">{network.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-bees-gray-200 rounded-full h-2 max-w-[120px]">
                              <div
                                className={`h-2 rounded-full ${getStatusClass(network.adherence).replace('text-', 'bg-')}`}
                                style={{ width: `${Math.min(network.adherence, 100)}%` }}
                              />
                            </div>
                            <span className={`font-bold ${getStatusClass(network.adherence)}`}>
                              {network.adherence.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-bees-gray-600">{network.weight.toFixed(1)}%</td>
                        <td className="py-3 px-4 text-bees-gray-600">{network.stores}</td>
                        <td className="py-3 px-4">{getStatusIcon(network.adherence)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      <AdvancedFilters isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} />
      <AlertsPanel isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
    </div>
  );
}
