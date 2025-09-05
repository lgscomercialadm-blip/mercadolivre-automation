import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon
} from '@mui/icons-material';

interface DashboardModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data?: any;
  type?: 'product' | 'campaign' | 'metric' | 'general';
}

const DashboardModal: React.FC<DashboardModalProps> = ({
  open,
  onClose,
  title,
  data = {},
  type = 'general'
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const renderProductDetails = () => (
    <Box display="flex" flexWrap="wrap" gap={2}>
      <Box flex="1" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <AttachMoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Informações Financeiras
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Preço Atual" 
                  secondary={formatCurrency(data.preco || 0)}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="ROI" 
                  secondary={`${data.roi || 0}%`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Receita Total" 
                  secondary={formatCurrency((data.preco || 0) * (data.vendas || 0))}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Performance de Vendas
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Vendas" 
                  secondary={formatNumber(data.vendas || 0)}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Visualizações" 
                  secondary={formatNumber(data.views || 0)}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Taxa de Conversão" 
                  secondary={`${((data.vendas || 0) / (data.views || 1) * 100).toFixed(2)}%`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detalhes Adicionais
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              <Chip label={`Categoria: ${data.categoria || 'N/A'}`} />
              <Chip 
                label={`Status: ${data.status || 'N/A'}`} 
                color={data.status === 'Ativo' ? 'success' : 'default'}
              />
              <Chip 
                label={`Estoque: ${data.estoque || 0}`}
                color={data.estoque < 10 ? 'warning' : 'default'}
              />
            </Box>
            {data.descricao && (
              <Typography variant="body2" paragraph>
                {data.descricao}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderCampaignDetails = () => (
    <Box display="flex" flexWrap="wrap" gap={2}>
      <Box flex="1" minWidth="250px">
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <AttachMoneyIcon fontSize="large" color="primary" />
            <Typography variant="h4">{formatCurrency(data.budget || 0)}</Typography>
            <Typography variant="body2" color="textSecondary">
              Orçamento
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1" minWidth="250px">
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <VisibilityIcon fontSize="large" color="info" />
            <Typography variant="h4">{formatNumber(data.impressoes || 0)}</Typography>
            <Typography variant="body2" color="textSecondary">
              Impressões
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1" minWidth="250px">
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <ShoppingCartIcon fontSize="large" color="success" />
            <Typography variant="h4">{data.ctr || 0}%</Typography>
            <Typography variant="body2" color="textSecondary">
              CTR
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Métricas de Performance
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <TrendingUpIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="CPC Médio" 
                  secondary={formatCurrency(data.cpc || 0)}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <StarIcon color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Qualidade do Anúncio" 
                  secondary={`${data.qualidade || 0}/10`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderMetricDetails = () => (
    <Box display="flex" flexWrap="wrap" gap={2}>
      <Box flex="1" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Análise Detalhada
            </Typography>
            <Typography variant="body1" paragraph>
              {data.descricao || 'Dados detalhados da métrica selecionada.'}
            </Typography>
            
            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">Valor Atual:</Typography>
              <Typography variant="h6" color="primary">
                {data.valor || 'N/A'}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">Tendência:</Typography>
              <Box display="flex" alignItems="center">
                {data.trend === 'up' ? (
                  <TrendingUpIcon color="success" />
                ) : (
                  <TrendingDownIcon color="error" />
                )}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {data.trendValue || '0%'}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Período:</Typography>
              <Typography variant="body2">
                {data.periodo || 'Últimos 30 dias'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderContent = () => {
    switch (type) {
      case 'product':
        return renderProductDetails();
      case 'campaign':
        return renderCampaignDetails();
      case 'metric':
        return renderMetricDetails();
      default:
        return (
          <Typography variant="body1">
            Informações detalhadas sobre {title}
          </Typography>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {renderContent()}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Fechar
        </Button>
        <Button variant="contained" onClick={onClose}>
          Ver Relatório Completo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardModal;
