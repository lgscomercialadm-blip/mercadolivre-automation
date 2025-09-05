export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  status: 'Ativo' | 'Inativo' | 'Pausado';
  preco: number;
  roi: number;
  sazonalidade: 'Alta' | 'Média' | 'Baixa';
  views: number;
  vendas: number;
  estoque: number;
  turnover: number;
  imagem: string | null;
  descricao?: string;
  marca?: string;
  condicao?: 'Novo' | 'Usado' | 'Recondicionado';
  frete_gratis?: boolean;
  disponibilidade?: number;
  sku?: string;
  categoria_id?: string;
  tags?: string[];
  avaliacao?: number;
  num_avaliacoes?: number;
  garantia?: string;
  peso?: number;
  dimensoes?: {
    altura: number;
    largura: number;
    profundidade: number;
  };
  variantes?: {
    id: string;
    nome: string;
    preco: number;
    estoque: number;
    sku: string;
  }[];
  fotos?: string[];
  atributos?: Record<string, any>;
  mercadolivre_id?: string;
  url_mercadolivre?: string;
  ultima_atualizacao?: string;
  data_criacao?: string;
}

export interface FiltrosProdutos {
  categoria?: string;
  status?: string;
  precoMin?: number;
  precoMax?: number;
  estoqueMin?: number;
  roiMin?: number;
  sazonalidade?: string;
  busca?: string;
  ordenacao?: 'nome' | 'preco' | 'roi' | 'vendas' | 'estoque';
  direcao?: 'asc' | 'desc';
}

export interface ConfiguracaoAnuncio {
  titulo: string;
  descricao: string;
  preco: number;
  categoria_id: string;
  fotos: File[];
  atributos: Record<string, any>;
  frete_gratis: boolean;
  condicao: 'new' | 'used' | 'not_specified';
  garantia?: string;
  disponibilidade: number;
  tipo_publicacao: 'free' | 'classic' | 'premium';
}
