import { createContext, useContext, useState, ReactNode } from 'react';
import Papa from 'papaparse';
import { DataRow, ProcessedData, NetworkData, StoreData, DetractorStore, SKUData } from '@/shared/types';

interface DataContextType {
  allData: DataRow[];
  processedData: ProcessedData;
  isLoading: boolean;
  loadDataFromSheets: (url: string) => Promise<void>;
  filterDataByWeek: (week: string) => void;
  totalGlobalLojas: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const META = 65.0;

export function DataProvider({ children }: { children: ReactNode }) {
  const [allData, setAllData] = useState<DataRow[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData>({
    totalAdherence: 0,
    networks: [],
    stores: [],
    filters: {
      networks: [],
      regions: [],
      channels: [],
      products: [],
      weeks: [],
    },
    latestWeekEnd: null,
    detractorStores: [],
    activationSkus: [],
    nonActivationSkus: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [storeWeightMap, setStoreWeightMap] = useState<Map<string, { name: string; countLojas: number }>>(new Map());
  const [totalGlobalLojas, setTotalGlobalLojas] = useState(0);

  const calculateGlobalWeights = (data: DataRow[]) => {
    const lojasUnicasGlobais = new Map<string, boolean>();
    const redesGlobaisMap = new Map<string, { name: string; countLojas: number }>();

    data.forEach((row) => {
      const rede = row.REDE ? String(row.REDE) : null;
      const loja = row.CNPJ ? String(row.CNPJ) : null;
      if (!rede || !loja) return;

      const lojaId = `${rede}-${loja}`;
      if (!lojasUnicasGlobais.has(lojaId)) {
        lojasUnicasGlobais.set(lojaId, true);

        if (!redesGlobaisMap.has(rede)) {
          redesGlobaisMap.set(rede, { name: rede, countLojas: 0 });
        }
        const redeData = redesGlobaisMap.get(rede)!;
        redeData.countLojas += 1;
      }
    });

    setTotalGlobalLojas(lojasUnicasGlobais.size);
    setStoreWeightMap(redesGlobaisMap);
  };

  const processAllData = (data: DataRow[]) => {
    const lojasMap = new Map<string, { rede: string; loja: string; ttcOK: number; totalSKUs: number; aderencia: number }>();
    const redesMap = new Map<string, { name: string; somaAderencia: number; countLojas: number }>();

    const uniqueRegions = new Set<string>();
    const uniqueChannels = new Set<string>();
    const uniqueNetworks = new Set<string>();
    const uniqueProducts = new Set<string>();
    const uniqueWeeks = new Set<string>();
    let latestWeekEnd: Date | null = null;

    const stores: StoreData[] = [];

    data.forEach((row) => {
      const rede = row.REDE ? String(row.REDE) : null;
      const loja = row.CNPJ ? String(row.CNPJ) : null;
      if (!rede || !loja) return;

      const weekStart = row['DATA INÍCIO SEMANA NIELSEN'] ? String(row['DATA INÍCIO SEMANA NIELSEN']) : '';
      const weekEnd = row['DATA FIM SEMANA NIELSEN'] ? String(row['DATA FIM SEMANA NIELSEN']) : '';
      const produto = row.PRODUTO ? String(row.PRODUTO) : null;

      if (row.MICROREGIAO) uniqueRegions.add(String(row.MICROREGIAO));
      if (row.CANAL) uniqueChannels.add(String(row.CANAL));
      if (rede) uniqueNetworks.add(rede);
      if (produto) uniqueProducts.add(produto);
      if (weekStart) uniqueWeeks.add(weekStart);

      if (weekEnd) {
        try {
          const dateStr = String(weekEnd).includes('/') ? weekEnd : weekEnd.replace(/-/g, '/');
          const parts = dateStr.split('/');
          let currentDate: Date;
          if (parts.length === 3 && parts[0].length <= 2) {
            if (parts[1].length > 2) {
              currentDate = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
            } else {
              currentDate = new Date(dateStr);
            }
          } else {
            currentDate = new Date(dateStr);
          }

          if (!isNaN(currentDate.getTime())) {
            if (!latestWeekEnd || currentDate > latestWeekEnd) {
              latestWeekEnd = currentDate;
            }
          }
        } catch (e) {
          console.warn('Formato de data inválido:', weekEnd);
        }
      }

      const lojaId = `${rede}-${loja}`;
      const ttcOK = Number(row['TTC OK']) || 0;
      const ttcAcima = Number(row['TTC ACIMA']) || 0;
      const ttcAbaixo = Number(row['TTC ABAIXO']) || 0;
      const totalSKUs = ttcOK + ttcAcima + ttcAbaixo;

      if (totalSKUs > 0) {
        const aderenciaSKU = ttcOK / totalSKUs;
        stores.push({
          network: rede,
          store: loja,
          product: produto || '',
          ttcOk: ttcOK,
          ttcBelow: ttcAbaixo,
          ttcAbove: ttcAcima,
          adherence: aderenciaSKU * 100,
          region: String(row.MICROREGIAO || ''),
          channel: String(row.CANAL || ''),
          weekStart: weekStart,
          weekEnd: weekEnd,
        });
      }

      if (!lojasMap.has(lojaId)) {
        lojasMap.set(lojaId, {
          rede: rede,
          loja: loja,
          ttcOK: 0,
          totalSKUs: 0,
          aderencia: 0,
        });
      }
      const lojaData = lojasMap.get(lojaId)!;
      lojaData.ttcOK += ttcOK;
      lojaData.totalSKUs += totalSKUs;
    });

    lojasMap.forEach((lojaData) => {
      const aderenciaLoja = lojaData.totalSKUs > 0 ? lojaData.ttcOK / lojaData.totalSKUs : 0;
      lojaData.aderencia = aderenciaLoja;

      if (!redesMap.has(lojaData.rede)) {
        redesMap.set(lojaData.rede, {
          name: lojaData.rede,
          somaAderencia: 0,
          countLojas: 0,
        });
      }
      const redeData = redesMap.get(lojaData.rede)!;
      redeData.somaAderencia += aderenciaLoja;
      redeData.countLojas += 1;
    });

    let aderenciaTotalPonderada = 0;
    const networks: NetworkData[] = [];

    storeWeightMap.forEach((redeGlobal, redeName) => {
      const redeAtual = redesMap.get(redeName);
      let aderenciaRede = 0;

      if (redeAtual) {
        aderenciaRede = redeAtual.countLojas > 0 ? redeAtual.somaAderencia / redeAtual.countLojas : 0;
      }

      const pesoRede = totalGlobalLojas > 0 ? redeGlobal.countLojas / totalGlobalLojas : 0;

      aderenciaTotalPonderada += aderenciaRede * pesoRede;

      networks.push({
        name: redeName,
        adherence: aderenciaRede * 100,
        weight: pesoRede * 100,
        stores: redeGlobal.countLojas,
        impact: (aderenciaRede - META / 100) * pesoRede * 100,
      });
    });

    // Calculate detractor stores and SKUs
    const detractorStores: DetractorStore[] = [];
    lojasMap.forEach((lojaData) => {
      detractorStores.push({
        name: lojaData.rede,
        store: lojaData.loja,
        adherence: lojaData.aderencia * 100,
      });
    });

    const skusMap = new Map<string, { ttcOK: number; ttcTotal: number }>();
    data.forEach((row) => {
      const produto = row.PRODUTO ? String(row.PRODUTO) : null;
      if (!produto) return;

      const ttcOK = Number(row['TTC OK']) || 0;
      const ttcAcima = Number(row['TTC ACIMA']) || 0;
      const ttcAbaixo = Number(row['TTC ABAIXO']) || 0;
      const totalSKUs = ttcOK + ttcAcima + ttcAbaixo;

      if (!skusMap.has(produto)) {
        skusMap.set(produto, { ttcOK: 0, ttcTotal: 0 });
      }
      const skuData = skusMap.get(produto)!;
      skuData.ttcOK += ttcOK;
      skuData.ttcTotal += totalSKUs;
    });

    const activationSkus: SKUData[] = [];
    const nonActivationSkus: SKUData[] = [];
    skusMap.forEach((data, produto) => {
      if (data.ttcOK > 0) {
        activationSkus.push({ product: produto, ttcOk: data.ttcOK });
      } else if (data.ttcTotal > 0) {
        nonActivationSkus.push({ product: produto, ttcNotOk: data.ttcTotal });
      }
    });

    setProcessedData({
      totalAdherence: aderenciaTotalPonderada * 100,
      networks,
      stores,
      filters: {
        networks: [...uniqueNetworks].sort(),
        regions: [...uniqueRegions].sort(),
        channels: [...uniqueChannels].sort(),
        products: [...uniqueProducts].sort(),
        weeks: [...uniqueWeeks].sort(),
      },
      latestWeekEnd,
      detractorStores: detractorStores.sort((a, b) => a.adherence - b.adherence),
      activationSkus: activationSkus.sort((a, b) => (b.ttcOk || 0) - (a.ttcOk || 0)),
      nonActivationSkus: nonActivationSkus.sort((a, b) => (b.ttcNotOk || 0) - (a.ttcNotOk || 0)),
    });
  };

  const loadDataFromSheets = async (url: string) => {
    if (!url || !url.includes('pub?output=csv')) {
      if (url.includes('/edit')) {
        alert('Erro: Parece que você colou o link de edição. Você precisa publicar a planilha na web como CSV.');
      } else {
        alert('Por favor, insira uma URL do Google Sheets válida (publicada como CSV).');
      }
      return;
    }

    setIsLoading(true);

    return new Promise<void>((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const data = results.data as DataRow[];
          setAllData(data);
          calculateGlobalWeights(data);
          processAllData(data);
          setIsLoading(false);
          resolve();
        },
        error: (err) => {
          console.error('Erro ao buscar dados:', err);
          alert('Erro ao carregar dados. Verifique o link e se a planilha está publicada corretamente.');
          setIsLoading(false);
          reject(err);
        },
      });
    });
  };

  const filterDataByWeek = (week: string) => {
    setIsLoading(true);
    let dataToProcess = allData;

    if (week !== '') {
      dataToProcess = allData.filter((row) => String(row['DATA INÍCIO SEMANA NIELSEN']) === week);
    }

    processAllData(dataToProcess);
    setIsLoading(false);
  };

  return (
    <DataContext.Provider
      value={{
        allData,
        processedData,
        isLoading,
        loadDataFromSheets,
        filterDataByWeek,
        totalGlobalLojas,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
