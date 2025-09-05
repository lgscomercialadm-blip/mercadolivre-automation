import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';

interface Product {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  condition: string;
  sold_quantity: number;
  available_quantity: number;
  rating?: number;
  reviews_count?: number;
  category?: string;
  seller?: {
    id: string;
    nickname: string;
    reputation?: {
      level_id: string;
      power_seller_status: string;
    };
  };
  shipping?: {
    free_shipping: boolean;
    mode: string;
  };
  attributes?: Array<{
    id: string;
    name: string;
    value_name: string;
  }>;
}

interface ProductDetailModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  open,
  onClose,
  product
}) => {
  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getConditionLabel = (condition: string) => {
    const conditions: { [key: string]: string } = {
      'new': 'Novo',
      'used': 'Usado',
      'refurbished': 'Recondicionado'
    };
    return conditions[condition] || condition;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" sx={{ pr: 2, lineHeight: 1.3 }}>
            {product.title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Imagem e Informações Principais */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 200, maxWidth: 300 }}>
              <img
                src={product.thumbnail}
                alt={product.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 8,
                  border: '1px solid #e0e0e0'
                }}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 250 }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatPrice(product.price)}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={getConditionLabel(product.condition)}
                  color={product.condition === 'new' ? 'success' : 'default'}
                  size="small"
                />
                
                {product.shipping?.free_shipping && (
                  <Chip
                    label="Frete Grátis"
                    color="primary"
                    size="small"
                  />
                )}

                {product.category && (
                  <Chip
                    label={product.category}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>

              {/* Rating */}
              {product.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StarIcon color="warning" />
                  <Typography variant="body1">
                    {product.rating.toFixed(1)}
                  </Typography>
                  {product.reviews_count && (
                    <Typography variant="body2" color="text.secondary">
                      ({product.reviews_count} avaliações)
                    </Typography>
                  )}
                </Box>
              )}

              {/* Vendas e Estoque */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Typography variant="body2">
                  <strong>Vendidos:</strong> {product.sold_quantity} unidades
                </Typography>
                <Typography variant="body2">
                  <strong>Disponível:</strong> {product.available_quantity} unidades
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Informações do Vendedor */}
          {product.seller && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Informações do Vendedor
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1">
                  <strong>Vendedor:</strong> {product.seller.nickname}
                </Typography>
                {product.seller.reputation && (
                  <>
                    <Typography variant="body2">
                      <strong>Nível:</strong> {product.seller.reputation.level_id}
                    </Typography>
                    {product.seller.reputation.power_seller_status && (
                      <Chip
                        label="MercadoLíder"
                        color="warning"
                        size="small"
                        sx={{ alignSelf: 'flex-start' }}
                      />
                    )}
                  </>
                )}
              </Box>
            </Box>
          )}

          {/* Atributos do Produto */}
          {product.attributes && product.attributes.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Especificações
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 1 }}>
                  {product.attributes.slice(0, 6).map((attr) => (
                    <Box key={attr.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {attr.name}:
                      </Typography>
                      <Typography variant="body2">
                        {attr.value_name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={() => window.open(`https://mercadolivre.com.br/p/${product.id}`, '_blank')}
        >
          Ver no ML
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<FavoriteIcon />}
        >
          Favoritar
        </Button>
        
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={() => window.open(`https://mercadolivre.com.br/p/${product.id}`, '_blank')}
        >
          Comprar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDetailModal;
