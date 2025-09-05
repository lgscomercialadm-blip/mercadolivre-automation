/**
 * Componente de Autenticação OAuth2 com Mercado Livre
 */
import React, { useState, useEffect } from 'react';
import { useOAuth, useMLApi } from '../services/oauthService';

const OAuthLogin: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [oauthStatus, setOauthStatus] = useState<any>(null);
  const [mlStatus, setMlStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { startLogin, getStatus, checkBackend } = useOAuth();
  const { getStatus: getMLStatus, testConnection } = useMLApi();

  useEffect(() => {
    const checkServices = async () => {
      try {
        // Verifica backend
        const isBackendOnline = await checkBackend();
        setBackendStatus(isBackendOnline ? 'online' : 'offline');

        if (isBackendOnline) {
          // Verifica OAuth status
          try {
            const oauthData = await getStatus();
            setOauthStatus(oauthData);
          } catch (err) {
            console.log('OAuth status não disponível ainda');
          }

          // Verifica ML APIs
          try {
            const mlData = await getMLStatus();
            setMlStatus(mlData);
          } catch (err) {
            console.log('ML API status não disponível ainda');
          }

          // Testa conexão ML
          try {
            const testResult = await testConnection();
            console.log('Teste ML:', testResult);
          } catch (err) {
            console.log('Teste ML não disponível ainda');
          }
        }
      } catch (err) {
        setError('Erro ao verificar serviços');
        console.error('Erro:', err);
      }
    };

    checkServices();
  }, []);

  const handleLogin = async () => {
    try {
      setError(null);
      await startLogin();
    } catch (err) {
      setError('Erro ao iniciar login');
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🚀 ML Integration
        </h2>
        <p className="text-gray-600">
          Conecte-se ao Mercado Livre
        </p>
      </div>

      {/* Status do Backend */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${
            backendStatus === 'online' ? 'bg-green-500' : 
            backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></div>
          <span className="text-sm font-medium">
            Backend: {backendStatus === 'loading' ? 'Verificando...' : backendStatus}
          </span>
        </div>
      </div>

      {/* Status OAuth */}
      {oauthStatus && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-1">OAuth2 Status</h4>
          <p className="text-sm text-blue-700">{oauthStatus.message}</p>
          {oauthStatus.ready && (
            <div className="text-xs text-green-600 mt-1">
              ✅ Client ID: {oauthStatus.client_id}
            </div>
          )}
        </div>
      )}

      {/* Status ML APIs */}
      {mlStatus && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-1">Mercado Livre APIs</h4>
          <div className="text-sm text-purple-700">
            Status: {mlStatus.ml_api_online ? '🟢 Online' : '🔴 Offline'}
          </div>
          {mlStatus.endpoints_available && (
            <div className="text-xs text-purple-600 mt-1">
              {mlStatus.endpoints_available.length} endpoints disponíveis
            </div>
          )}
        </div>
      )}

      {/* Botão de Login */}
      <div className="space-y-3">
        {backendStatus === 'online' ? (
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105"
          >
            🔐 Conectar com Mercado Livre
          </button>
        ) : (
          <div className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-4 rounded-lg text-center">
            Backend Offline
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Info adicional */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>OAuth2 + PKCE Seguro</p>
        <p>Desenvolvido com FastAPI + React</p>
      </div>
    </div>
  );
};

export default OAuthLogin;
