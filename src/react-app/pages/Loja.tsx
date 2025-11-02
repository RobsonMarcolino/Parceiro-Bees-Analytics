import { useState, useEffect } from 'react';
import { useData } from '@/react-app/context/DataContext';
import { Store, Star, AlertTriangle } from 'lucide-react';
import { DetractorStore, SKUData } from '@/shared/types';

const META = 65.0;

export default function Loja() {
  const { allData, processedData } = useData();
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [detractorStores, setDetractorStores] = useState<DetractorStore[]>([]);
  const [activationSkus, setActivationSkus] = useState<SKUData[]>([]);
  const [nonActivationSkus, setNonActivationSkus] = useState<SKUData[]>([]);

  useEffect(() => {
    if (allData.length === 0) return;

    let dataToProcess = allData;
    if (selectedWeek) {
      dataToProcess = dataToProcess.filter(
        (row) => String(row['DATA INÍCIO SEMANA NIELSEN']) === selectedWeek
      );
    }
    if (selectedNetwork) {
      dataToProcess = dataToProcess.filter((row) => String(row.REDE) === selectedNetwork);
    }

    const lojasMap = new Map<
      string,
      { name: string; store: string; ttcOK: number; totalSKUs: number }
    >();
    const skusMap = new Map<string, { ttcOK: number; ttcTotal: number }>();

    dataToProcess.forEach((row) => {
      const loja = row.CNPJ ? String(row.CNPJ) : null;
      const rede = row.REDE ? String(row.REDE) : null;
      if (!loja || !rede) return;

      const lojaId = `${rede}-${loja}`;
      const ttcOK = Number(row['TTC OK']) || 0;
      const ttcAcima = Number(row['TTC ACIMA']) || 0;
      const ttcAbaixo = Number(row['TTC ABAIXO']) || 0;
      const totalSKUs = ttcOK + ttcAcima + ttcAbaixo;
      const produto = row.PRODUTO ? String(row.PRODUTO) : null;

      if (!lojasMap.has(lojaId)) {
        lojasMap.set(lojaId, { name: rede, store: loja, ttcOK: 0, totalSKUs: 0 });
      }
      const lojaData = lojasMap.get(lojaId)!;
      lojaData.ttcOK += ttcOK;
      lojaData.totalSKUs += totalSKUs;

      if (produto) {
        if (!skusMap.has(produto)) {
          skusMap.set(produto, { ttcOK: 0, ttcTotal: 0 });
        }
        const skuData = skusMap.get(produto)!;
        skuData.ttcOK += ttcOK;
        skuData.ttcTotal += totalSKUs;
      }
    });

    const detractors: DetractorStore[] = [];
    lojasMap.forEach((lojaData) => {
      const aderenciaLoja =
        lojaData.totalSKUs > 0 ? (lojaData.ttcOK / lojaData.totalSKUs) * 100 : 0;
      detractors.push({
        name: lojaData.name,
        store: lojaData.store,
        adherence: aderenciaLoja,
      });
    });

    const activation: SKUData[] = [];
    const nonActivation: SKUData[] = [];
    skusMap.forEach((data, produto) => {
      if (data.ttcOK > 0) {
        activation.push({ product: produto, ttcOk: data.ttcOK });
      } else if (data.ttcTotal > 0) {
        nonActivation.push({ product: produto, ttcNotOk: data.ttcTotal });
      }
    });

    setDetractorStores(detractors.sort((a, b) => a.adherence - b.adherence));
    setActivationSkus(activation.sort((a, b) => (b.ttcOk || 0) - (a.ttcOk || 0)));
    setNonActivationSkus(nonActivation.sort((a, b) => (b.ttcNotOk || 0) - (a.ttcNotOk || 0)));
  }, [allData, selectedNetwork, selectedWeek]);

  const getStatusClass = (adherence: number) => {
    if (adherence >= META) return 'text-success';
    if (adherence < META - 15) return 'text-danger';
    return 'text-warning';
  };

  if (allData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-bees-gray-500">Carregue os dados primeiro no Dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-bees-light-card border border-bees-light-border rounded-xl p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-bees-gray-700 mb-2">
              Filtrar por Rede
            </label>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-bees-light-border rounded-lg text-bees-gray-800 focus:outline-none focus:ring-2 focus:ring-bees-yellow focus:border-bees-yellow"
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
              Filtrar por Semana
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-bees-light-border rounded-lg text-bees-gray-800 focus:outline-none focus:ring-2 focus:ring-bees-yellow focus:border-bees-yellow"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detractor Stores */}
        <div className="bg-bees-light-card border border-bees-light-border rounded-xl p-6 animate-slide-up shadow-md">
          <h2 className="text-lg font-bold text-danger mb-4 flex items-center gap-2">
            <Store className="w-5 h-5" />
            Lojas Detratoras (Pior Aderência)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bees-light-border">
                  <th className="text-left py-2 px-3 text-bees-gray-700 text-sm">#</th>
                  <th className="text-left py-2 px-3 text-bees-gray-700 text-sm">Rede</th>
                  <th className="text-left py-2 px-3 text-bees-gray-700 text-sm">CNPJ (Loja)</th>
                  <th className="text-left py-2 px-3 text-bees-gray-700 text-sm">Aderência</th>
                </tr>
              </thead>
              <tbody>
                {detractorStores.slice(0, 20).map((store, index) => (
                  <tr key={`${store.name}-${store.store}`} className="border-b border-bees-light-border">
                    <td className="py-2 px-3 text-bees-gray-800 font-bold">{index + 1}</td>
                    <td className="py-2 px-3 text-bees-gray-600">{store.name}</td>
                    <td className="py-2 px-3 text-bees-gray-600 font-mono text-sm">{store.store}</td>
                    <td className={`py-2 px-3 font-bold ${getStatusClass(store.adherence)}`}>
                      {store.adherence.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SKUs */}
        <div className="space-y-6">
          {/* Activated SKUs */}
          <div className="bg-bees-light-card border border-bees-light-border rounded-xl p-6 animate-slide-up shadow-md" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-lg font-bold text-success mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              SKUs Ativados (TTC OK)
            </h2>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-bees-light-card">
                  <tr className="border-b border-bees-light-border">
                    <th className="text-left py-2 px-3 text-bees-gray-700 text-sm">#</th>
                    <th className="text-left py-2 px-3 text-bees-gray-700 text-sm">Produto</th>
                    <th className="text-left py-2 px-3 text-bees-gray-700 text-sm">Total TTC OK</th>
                  </tr>
                </thead>
                <tbody>
                  {activationSkus.slice(0, 15).map((sku, index) => (
                    <tr key={sku.product} className="border-b border-bees-light-border">
                      <td className="py-2 px-3 text-bees-gray-800 font-bold">{index + 1}º</td>
                      <td className="py-2 px-3 text-bees-gray-600 text-sm truncate max-w-[200px]" title={sku.product}>
                        {sku.product}
                      </td>
                      <td className="py-2 px-3 text-success font-bold">{sku.ttcOk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Non-Activated SKUs */}
          <div className="bg-bees-light-card border border-bees-light-border rounded-xl p-6 animate-slide-up shadow-md" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-lg font-bold text-bees-gray-700 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              SKUs Não Ativados
            </h2>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-bees-light-card">
                  <tr className="border-b border-bees-light-border">
                    <th className="text-left py-2 px-3 text-bees-gray-700 text-sm">#</th>
                    <th className="text-left py-2 px-3 text-bees-gray-700 text-sm">Produto</th>
                    <th className="text-left py-2 px-3 text-bees-gray-700 text-sm">Total Planejado</th>
                  </tr>
                </thead>
                <tbody>
                  {nonActivationSkus.slice(0, 15).map((sku, index) => (
                    <tr key={sku.product} className="border-b border-bees-light-border">
                      <td className="py-2 px-3 text-bees-gray-800 font-bold">{index + 1}º</td>
                      <td className="py-2 px-3 text-bees-gray-600 text-sm truncate max-w-[200px]" title={sku.product}>
                        {sku.product}
                      </td>
                      <td className="py-2 px-3 text-danger font-bold">{sku.ttcNotOk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
