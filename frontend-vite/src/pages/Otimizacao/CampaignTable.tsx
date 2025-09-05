import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Box,
  Typography,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Button
} from '@mui/material';
import {
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  ContentCopy as ContentCopyIcon,
  Assessment as AssessmentIcon,
  Campaign as CampaignIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';

interface Campaign {
  id: string;
  nome: string;
  tipo: 'product_ads' | 'brand_ads' | 'display';
  status: 'ativa' | 'pausada' | 'finalizada' | 'rascunho';
  budget_diario: number;
  budget_total: number;
  gasto_atual: number;
  impressoes: number;
  cliques: number;
  ctr: number;
  cpc: number;
  conversoes: number;
  custo_conversao: number;
  roas: number;
  data_inicio: string;
  data_fim?: string;
  produtos_anunciados: number;
  otimizacao_auto: boolean;
}

interface CampaignTableProps {
  campaigns: Campaign[];
  loading?: boolean;
  onCampaignClick?: (campaign: Campaign) => void;
  onCampaignEdit?: (campaign: Campaign) => void;
  onCampaignAction?: (campaign: Campaign, action: string) => void;
  onToggleAutoOptimization?: (campaignId: string, enabled: boolean) => void;
}

type OrderBy = keyof Campaign;
type Order = 'asc' | 'desc';

const CampaignTable: React.FC<CampaignTableProps> = ({
  campaigns,
  loading = false,
  onCampaignClick,
  onCampaignEdit,
  onCampaignAction,
  onToggleAutoOptimization
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('data_inicio');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'success';
      case 'pausada':
        return 'warning';
      case 'finalizada':
        return 'info';
      case 'rascunho':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'product_ads':
        return 'primary';
      case 'brand_ads':
        return 'secondary';
      case 'display':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'product_ads':
        return 'Product Ads';
      case 'brand_ads':
        return 'Brand Ads';
      case 'display':
        return 'Display';
      default:
        return tipo;
    }
  };

  const getRoasColor = (roas: number) => {
    if (roas >= 4) return 'success';
    if (roas >= 2) return 'warning';
    return 'error';
  };

  const getBudgetProgress = (gasto: number, budget: number) => {
    return Math.min((gasto / budget) * 100, 100);
  };

  // Ordenar campanhas
  const sortedCampaigns = React.useMemo(() => {
    return [...campaigns].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [campaigns, order, orderBy]);

  // Campanhas da página atual
  const paginatedCampaigns = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedCampaigns.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedCampaigns, page, rowsPerPage]);

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, campaign: Campaign) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCampaign(null);
  };

  const handleMenuAction = (action: string) => {
    if (selectedCampaign && onCampaignAction) {
      onCampaignAction(selectedCampaign, action);
    }
    handleMenuClose();
  };

  const handleAutoOptimizationToggle = (campaign: Campaign, enabled: boolean) => {
    if (onToggleAutoOptimization) {
      onToggleAutoOptimization(campaign.id, enabled);
    }
  };

  return (
    <Paper>
      {loading && <LinearProgress />}
      
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Campanha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'budget_diario'}
                  direction={orderBy === 'budget_diario' ? order : 'asc'}
                  onClick={() => handleRequestSort('budget_diario')}
                >
                  Budget
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'impressoes'}
                  direction={orderBy === 'impressoes' ? order : 'asc'}
                  onClick={() => handleRequestSort('impressoes')}
                >
                  Impressões
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'ctr'}
                  direction={orderBy === 'ctr' ? order : 'asc'}
                  onClick={() => handleRequestSort('ctr')}
                >
                  CTR
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'cpc'}
                  direction={orderBy === 'cpc' ? order : 'asc'}
                  onClick={() => handleRequestSort('cpc')}
                >
                  CPC
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'roas'}
                  direction={orderBy === 'roas' ? order : 'asc'}
                  onClick={() => handleRequestSort('roas')}
                >
                  ROAS
                </TableSortLabel>
              </TableCell>
              <TableCell>Auto-Otimização</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCampaigns.map((campaign) => (
              <TableRow
                key={campaign.id}
                hover
                onClick={() => onCampaignClick?.(campaign)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <CampaignIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {campaign.nome}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {campaign.produtos_anunciados} produtos
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getTipoLabel(campaign.tipo)}
                    size="small"
                    color={getTipoColor(campaign.tipo) as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={campaign.status.toUpperCase()}
                    size="small"
                    color={getStatusColor(campaign.status) as any}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(campaign.gasto_atual)} / {formatCurrency(campaign.budget_diario)}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={getBudgetProgress(campaign.gasto_atual, campaign.budget_diario)}
                      sx={{ mt: 0.5, height: 4 }}
                      color={getBudgetProgress(campaign.gasto_atual, campaign.budget_diario) > 80 ? 'warning' : 'primary'}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatNumber(campaign.impressoes)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatPercentage(campaign.ctr)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatCurrency(campaign.cpc)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${campaign.roas.toFixed(1)}x`}
                    size="small"
                    color={getRoasColor(campaign.roas) as any}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={campaign.otimizacao_auto}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleAutoOptimizationToggle(campaign, e.target.checked);
                    }}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center">
                    <Tooltip title="Visualizar relatório">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCampaignClick?.(campaign);
                        }}
                      >
                        <AssessmentIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar campanha">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCampaignEdit?.(campaign);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mais opções">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, campaign)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={campaigns.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Campanhas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleMenuAction('view')}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver Relatório</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('duplicate')}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicar</ListItemText>
        </MenuItem>
        {selectedCampaign?.status === 'ativa' ? (
          <MenuItem onClick={() => handleMenuAction('pause')}>
            <ListItemIcon>
              <PauseIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Pausar</ListItemText>
          </MenuItem>
        ) : selectedCampaign?.status === 'pausada' ? (
          <MenuItem onClick={() => handleMenuAction('resume')}>
            <ListItemIcon>
              <PlayArrowIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Retomar</ListItemText>
          </MenuItem>
        ) : null}
        <MenuItem onClick={() => handleMenuAction('stop')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <StopIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Finalizar</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default CampaignTable;
