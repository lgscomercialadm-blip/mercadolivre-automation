/**
 * Serviço de OAuth2 para integração com Mercado Livre
 * Conecta com o backend OAuth2 + PKCE funcionando
 */

const API_BASE_URL = 'http://localhost:8001';

export interface OAuthStatus {
  oauth_configured: boolean;
  client_id: string;
  redirect_uri: string;
  ready: boolean;
  message: string;
}

export interface MLApiStatus {
  ml_api_online: boolean;
  response_time_ms: string;
  endpoints_available: string[];
  authentication_required: string[];
}

export interface MLCategory {
  id: string;
  name: string;
  total_items_in_this_category?: number;
}

export interface MLProduct {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  condition: string;
  thumbnail: string;
  permalink: string;
  seller: {
    id: number;
    nickname: string;
  };
}

export interface MLSearchResult {
  success: boolean;
  query: string;
  total_results: number;
  showing: number;
  products: MLProduct[];
}

class OAuthService {
  /**
   * Inicia o processo de autenticação OAuth2 com Mercado Livre
   */
  async startOAuthFlow(): Promise<void> {
    try {
      // Redireciona para o endpoint OAuth do backend
      window.location.href = `${API_BASE_URL}/api/oauth-simple/login`;
    } catch (error) {
      console.error('Erro ao iniciar OAuth:', error);
      throw new Error('Falha ao iniciar autenticação com Mercado Livre');
    }
  }

  /**
   * Verifica o status do OAuth
   */
  async getOAuthStatus(): Promise<OAuthStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/oauth-simple/status`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar status OAuth:', error);
      throw new Error('Falha ao verificar status do OAuth');
    }
  }

  /**
   * Verifica se o backend está funcionando
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Backend não acessível:', error);
      return false;
    }
  }
}

class MLApiService {
  /**
   * Verifica status das APIs do Mercado Livre
   */
  async getMLApiStatus(): Promise<MLApiStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ml/status`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar APIs ML:', error);
      throw new Error('Falha ao verificar APIs do Mercado Livre');
    }
  }

  /**
   * Busca categorias do Mercado Livre
   */
  async getCategories(): Promise<MLCategory[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ml-simple/categories`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.categories : [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new Error('Falha ao carregar categorias');
    }
  }

  /**
   * Busca produtos no Mercado Livre
   */
  async searchProducts(query: string): Promise<MLSearchResult> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ml-simple/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error('Falha ao buscar produtos');
    }
  }

  /**
   * Testa conectividade básica com ML
   */
  async testMLConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ml-simple/test`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao testar conexão ML:', error);
      return {
        success: false,
        message: 'Falha ao conectar com Mercado Livre'
      };
    }
  }
}

// Instâncias dos serviços
export const oAuthService = new OAuthService();
export const mlApiService = new MLApiService();

// Hooks para React
export const useOAuth = () => {
  return {
    startLogin: () => oAuthService.startOAuthFlow(),
    getStatus: () => oAuthService.getOAuthStatus(),
    checkBackend: () => oAuthService.checkBackendHealth()
  };
};

export const useMLApi = () => {
  return {
    getStatus: () => mlApiService.getMLApiStatus(),
    getCategories: () => mlApiService.getCategories(),
    searchProducts: (query: string) => mlApiService.searchProducts(query),
    testConnection: () => mlApiService.testMLConnection()
  };
};
