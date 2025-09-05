export interface Anuncio {
  id: number;
  imagem: string;
  titulo: string;
  preco: number;
  categoria: string;
  tipo: 'free' | 'classic' | 'premium' | 'gold_pro' | 'gold_special';
  frete: number;
  desconto: number;
  promocao: boolean;
  estoque: number;
  variacoes: Variacao[];
  vendas: number;
  visitas: number;
  relevancia: number;
  status?: 'ativo' | 'pausado' | 'finalizado' | 'cancelado';
  data_criacao?: string;
  data_termino?: string;
  mlb_id?: string;
  url_anuncio?: string;
  pergunta_count?: number;
  favoritos?: number;
  conversao?: number;
  custo_anuncio?: number;
  roi?: number;
  impressoes?: number;
  cliques?: number;
  ctr?: number;
  posicao_media?: number;
}

export interface Variacao {
  id: string;
  nome: string;
  valor: string;
  preco?: number;
  estoque?: number;
  sku?: string;
  imagens?: string[];
}

export interface FiltrosAnuncios {
  categoria?: string;
  tipo?: string;
  status?: string;
  promocao?: boolean;
  precoMin?: number;
  precoMax?: number;
  estoqueMin?: number;
  relevanciaMin?: number;
  busca?: string;
  ordenacao?: 'titulo' | 'preco' | 'vendas' | 'relevancia' | 'data_criacao';
  direcao?: 'asc' | 'desc';
}

export interface EstatisticasAnuncio {
  total_anuncios: number;
  anuncios_ativos: number;
  anuncios_pausados: number;
  total_vendas: number;
  receita_total: number;
  custo_total: number;
  roi_medio: number;
  ctr_medio: number;
  conversao_media: number;
  impressoes_totais: number;
  cliques_totais: number;
}

export interface ConfiguracaoAnuncio {
  titulo: string;
  categoria: string;
  tipo: string;
  preco: number;
  estoque: number;
  fotos: File[];
  descricao: string;
  atributos: Record<string, any>;
  variacoes: Variacao[];
  frete_gratis: boolean;
  mercado_envios: boolean;
  garantia?: string;
  condicao: 'new' | 'used' | 'not_specified';
}
