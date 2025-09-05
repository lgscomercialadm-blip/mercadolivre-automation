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
  Rating,
  Link
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Launch as LaunchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Compare as CompareIcon,
  Store as StoreIcon,
  Star as StarIcon
} from '@mui/icons-material';

interface Competitor {
  id: string;
  nome: string;
  logo?: string;
  categoria: string;
  preco: number;
  preco_anterior?: number;
  vendas_estimadas: number;
  rating: number;
  num_avaliacoes: number;
  shipping_custo: number;
  shipping_gratis: boolean;
  posicao_ranking: number;
  url_produto: string;
  seller_reputation: string;
  disponibilidade: number;
  ultima_atualizacao: string;
}

interface CompetitorTableProps {
  competitors: Competitor[];
  loading?: boolean;
  onCompetitorClick?: (competitor: Competitor) => void;
  onCompetitorAction?: (competitor: Competitor, action: string) => void;
}

type OrderBy = keyof Competitor;
type Order = 'asc' | 'desc';

const CompetitorTable: React.FC<CompetitorTableProps> = ({
  competitors,
  loading = false,
  onCompetitorClick,
  onCompetitorAction
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('posicao_ranking');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getReputationColor = (reputation: string) => {
    switch (reputation.toLowerCase()) {
      case 'platinum':
        return 'primary';
      case 'gold':
        return 'warning';
      case 'silver':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriceChangeIndicator = (preco: number, preco_anterior?: number) => {
    if (!preco_anterior) return null;
    
    const change = preco - preco_anterior;
    const changePercent = ((change / preco_anterior) * 100).toFixed(1);
    
    if (change > 0) {
      return (
        <Box display="flex" alignItems="center" color="error.main">
          <TrendingUpIcon fontSize="small" />
          <Typography variant="caption" sx={{ ml: 0.5 }}>
            +{changePercent}%
          </Typography>
        </Box>
      );
    } else if (change < 0) {
      return (
        <Box display="flex" alignItems="center" color="success.main">
          <TrendingDownIcon fontSize="small" />
          <Typography variant="caption" sx={{ ml: 0.5 }}>
            {changePercent}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Ordenar competitors
  const sortedCompetitors = React.useMemo(() => {
    return [...competitors].sort((a, b) => {
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
  }, [competitors, order, orderBy]);

  // Competitors da página atual
  const paginatedCompetitors = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedCompetitors.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedCompetitors, page, rowsPerPage]);

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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, competitor: Competitor) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCompetitor(competitor);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCompetitor(null);
  };

  const handleMenuAction = (action: string) => {
    if (selectedCompetitor && onCompetitorAction) {
      onCompetitorAction(selectedCompetitor, action);
    }
    handleMenuClose();
  };

  return (
    <Paper>
      {loading && <LinearProgress />}
      
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'posicao_ranking'}
                  direction={orderBy === 'posicao_ranking' ? order : 'asc'}
                  onClick={() => handleRequestSort('posicao_ranking')}
                >
                  Posição
                </TableSortLabel>
              </TableCell>
              <TableCell>Concorrente</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'preco'}
                  direction={orderBy === 'preco' ? order : 'asc'}
                  onClick={() => handleRequestSort('preco')}
                >
                  Preço
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'vendas_estimadas'}
                  direction={orderBy === 'vendas_estimadas' ? order : 'asc'}
                  onClick={() => handleRequestSort('vendas_estimadas')}
                >
                  Vendas Est.
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'rating'}
                  direction={orderBy === 'rating' ? order : 'asc'}
                  onClick={() => handleRequestSort('rating')}
                >
                  Avaliação
                </TableSortLabel>
              </TableCell>
              <TableCell>Frete</TableCell>
              <TableCell>Reputação</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'disponibilidade'}
                  direction={orderBy === 'disponibilidade' ? order : 'asc'}
                  onClick={() => handleRequestSort('disponibilidade')}
                >
                  Estoque
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCompetitors.map((competitor) => (
              <TableRow
                key={competitor.id}
                hover
                onClick={() => onCompetitorClick?.(competitor)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Chip 
                    label={`#${competitor.posicao_ranking}`}
                    size="small"
                    color={competitor.posicao_ranking <= 3 ? 'success' : 
                           competitor.posicao_ranking <= 10 ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={competitor.logo}
                      variant="rounded"
                      sx={{ width: 40, height: 40 }}
                    >
                      <StoreIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {competitor.nome}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {competitor.categoria}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(competitor.preco)}
                    </Typography>
                    {getPriceChangeIndicator(competitor.preco, competitor.preco_anterior)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatNumber(competitor.vendas_estimadas)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Rating 
                      value={competitor.rating} 
                      readOnly 
                      size="small" 
                      precision={0.1}
                    />
                    <Typography variant="caption" color="textSecondary">
                      ({formatNumber(competitor.num_avaliacoes)})
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {competitor.shipping_gratis ? (
                    <Chip label="GRÁTIS" size="small" color="success" />
                  ) : (
                    <Typography variant="body2">
                      {formatCurrency(competitor.shipping_custo)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={competitor.seller_reputation}
                    size="small"
                    color={getReputationColor(competitor.seller_reputation) as any}
                  />
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2"
                    color={competitor.disponibilidade < 5 ? 'error' : 'inherit'}
                  >
                    {competitor.disponibilidade > 0 ? 
                      formatNumber(competitor.disponibilidade) : 
                      'Sem estoque'
                    }
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center">
                    <Tooltip title="Visualizar detalhes">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompetitorClick?.(competitor);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ver produto original">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(competitor.url_produto, '_blank');
                        }}
                      >
                        <LaunchIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mais opções">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, competitor)}
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
        count={competitors.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Concorrentes por página:"
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
          <ListItemText>Visualizar Detalhes</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('compare')}>
          <ListItemIcon>
            <CompareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Comparar Preços</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('track')}>
          <ListItemIcon>
            <TrendingUpIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Acompanhar Preço</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('open')}>
          <ListItemIcon>
            <LaunchIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver no ML</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default CompetitorTable;
