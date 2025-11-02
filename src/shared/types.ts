import z from "zod";

export const DataRowSchema = z.object({
  REDE: z.string().optional(),
  CNPJ: z.string().optional(),
  PRODUTO: z.string().optional(),
  'TTC OK': z.number().optional(),
  'TTC ACIMA': z.number().optional(),
  'TTC ABAIXO': z.number().optional(),
  'DATA INÍCIO SEMANA NIELSEN': z.string().optional(),
  'DATA FIM SEMANA NIELSEN': z.string().optional(),
  MICROREGIAO: z.string().optional(),
  CANAL: z.string().optional(),
});

export type DataRow = z.infer<typeof DataRowSchema>;

export interface NetworkData {
  name: string;
  adherence: number;
  weight: number;
  stores: number;
  impact: number;
}

export interface StoreData {
  network: string;
  store: string;
  product: string;
  ttcOk: number;
  ttcBelow: number;
  ttcAbove: number;
  adherence: number;
  region: string;
  channel: string;
  weekStart: string;
  weekEnd: string;
}

export interface DetractorStore {
  name: string;
  store: string;
  adherence: number;
}

export interface SKUData {
  product: string;
  ttcOk?: number;
  ttcNotOk?: number;
}

export interface ProcessedData {
  totalAdherence: number;
  networks: NetworkData[];
  stores: StoreData[];
  filters: {
    networks: string[];
    regions: string[];
    channels: string[];
    products: string[];
    weeks: string[];
  };
  latestWeekEnd: Date | null;
  detractorStores: DetractorStore[];
  activationSkus: SKUData[];
  nonActivationSkus: SKUData[];
}
