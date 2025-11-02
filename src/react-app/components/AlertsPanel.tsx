import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Target, CheckCircle, X, Bell } from 'lucide-react';
import { useData } from '@/react-app/context/DataContext';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

interface AlertsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlertsPanel({ isOpen, onClose }: AlertsPanelProps) {
  const { processedData } = useData();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (processedData.totalAdherence > 0) {
      generateAlerts();
    }
  }, [processedData]);

  const generateAlerts = () => {
    const newAlerts: Alert[] = [];

    // Alerta de aderência total
    if (processedData.totalAdherence < 65) {
      newAlerts.push({
        id: 'total-adherence',
        type: 'critical',
        title: 'Aderência Abaixo da Meta',
        message: `A aderência total está em ${processedData.totalAdherence.toFixed(1)}%, abaixo da meta de 65%.`,
        data: { current: processedData.totalAdherence, target: 65 },
        timestamp: new Date(),
      });
    }

    // Alertas de redes críticas
    const criticalNetworks = processedData.networks.filter(network => network.adherence < 50);
    if (criticalNetworks.length > 0) {
      newAlerts.push({
        id: 'critical-networks',
        type: 'critical',
        title: 'Redes em Situação Crítica',
        message: `${criticalNetworks.length} rede(s) com aderência abaixo de 50%: ${criticalNetworks.map(n => n.name).join(', ')}`,
        data: criticalNetworks,
        timestamp: new Date(),
      });
    }

    // Alertas de redes com baixa performance
    const warningNetworks = processedData.networks.filter(network => network.adherence >= 50 && network.adherence < 65);
    if (warningNetworks.length > 0) {
      newAlerts.push({
        id: 'warning-networks',
        type: 'warning',
        title: 'Redes Abaixo da Meta',
        message: `${warningNetworks.length} rede(s) entre 50% e 65% de aderência`,
        data: warningNetworks,
        timestamp: new Date(),
      });
    }

    // Alerta de lojas detratoras
    const criticalStores = processedData.detractorStores.filter(store => store.adherence < 30);
    if (criticalStores.length > 0) {
      newAlerts.push({
        id: 'critical-stores',
        type: 'critical',
        title: 'Lojas Críticas Identificadas',
        message: `${criticalStores.length} loja(s) com aderência abaixo de 30%`,
        data: criticalStores.slice(0, 5),
        timestamp: new Date(),
      });
    }

    // Alertas positivos
    const excellentNetworks = processedData.networks.filter(network => network.adherence >= 80);
    if (excellentNetworks.length > 0) {
      newAlerts.push({
        id: 'excellent-networks',
        type: 'info',
        title: 'Redes com Excelente Performance',
        message: `${excellentNetworks.length} rede(s) com aderência acima de 80%`,
        data: excellentNetworks,
        timestamp: new Date(),
      });
    }

    // Alerta de produtos sem ativação
    if (processedData.nonActivationSkus.length > 0) {
      newAlerts.push({
        id: 'non-activation-skus',
        type: 'warning',
        title: 'SKUs Sem Ativação',
        message: `${processedData.nonActivationSkus.length} produto(s) sem nenhuma ativação TTC`,
        data: processedData.nonActivationSkus.slice(0, 10),
        timestamp: new Date(),
      });
    }

    setAlerts(newAlerts);
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <TrendingDown className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getAlertStyle = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-green-200 bg-green-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Central de Alertas</h2>
            <span className="bg-white bg-opacity-20 text-white px-2 py-1 rounded-full text-sm">
              {alerts.length} alerta(s)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-600 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-bees-gray-800 mb-2">
                Nenhum Alerta Ativo
              </h3>
              <p className="text-bees-gray-600">
                Todas as métricas estão dentro dos parâmetros esperados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${getAlertStyle(alert.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-bees-gray-800 mb-1">
                            {alert.title}
                          </h3>
                          <p className="text-bees-gray-600 mb-3">
                            {alert.message}
                          </p>
                        </div>
                        <span className="text-xs text-bees-gray-500">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Dados detalhados do alerta */}
                      {alert.data && (
                        <div className="mt-3">
                          {alert.id === 'total-adherence' && (
                            <div className="bg-white bg-opacity-50 rounded p-3">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-red-600">
                                    {alert.data.current.toFixed(1)}%
                                  </div>
                                  <div className="text-xs text-bees-gray-500">Atual</div>
                                </div>
                                <Target className="w-4 h-4 text-bees-gray-400" />
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">
                                    {alert.data.target}%
                                  </div>
                                  <div className="text-xs text-bees-gray-500">Meta</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-bees-gray-600">
                                    -{(alert.data.target - alert.data.current).toFixed(1)}%
                                  </div>
                                  <div className="text-xs text-bees-gray-500">Gap</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {(alert.id === 'critical-networks' || alert.id === 'warning-networks' || alert.id === 'excellent-networks') && (
                            <div className="bg-white bg-opacity-50 rounded p-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {alert.data.slice(0, 6).map((network: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{network.name}</span>
                                    <span className={`text-sm font-bold ${
                                      network.adherence < 50 ? 'text-red-600' :
                                      network.adherence < 65 ? 'text-yellow-600' : 'text-green-600'
                                    }`}>
                                      {network.adherence.toFixed(1)}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {alert.id === 'critical-stores' && (
                            <div className="bg-white bg-opacity-50 rounded p-3">
                              <div className="space-y-2">
                                {alert.data.map((store: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center">
                                    <div>
                                      <span className="text-sm font-medium">{store.name}</span>
                                      <span className="text-xs text-bees-gray-500 ml-2">
                                        Loja {store.store}
                                      </span>
                                    </div>
                                    <span className="text-sm font-bold text-red-600">
                                      {store.adherence.toFixed(1)}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {alert.id === 'non-activation-skus' && (
                            <div className="bg-white bg-opacity-50 rounded p-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {alert.data.map((sku: any, index: number) => (
                                  <div key={index} className="text-sm text-bees-gray-700">
                                    {sku.product}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AlertsToggle({ onOpen }: { onOpen: () => void }) {
  const { processedData } = useData();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    if (processedData.totalAdherence > 0) {
      let count = 0;
      
      if (processedData.totalAdherence < 65) count++;
      if (processedData.networks.filter(n => n.adherence < 50).length > 0) count++;
      if (processedData.networks.filter(n => n.adherence >= 50 && n.adherence < 65).length > 0) count++;
      if (processedData.detractorStores.filter(s => s.adherence < 30).length > 0) count++;
      if (processedData.nonActivationSkus.length > 0) count++;
      
      setAlertCount(count);
    }
  }, [processedData]);

  return (
    <button
      onClick={onOpen}
      className="relative bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-semibold"
    >
      <Bell className="w-4 h-4" />
      Alertas
      {alertCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {alertCount}
        </span>
      )}
    </button>
  );
}
