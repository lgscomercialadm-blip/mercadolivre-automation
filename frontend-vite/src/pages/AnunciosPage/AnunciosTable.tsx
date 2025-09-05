import React, { useState, useMemo } from 'react';
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
  Checkbox,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Launch as LaunchIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocalOffer as LocalOfferIcon,
  Star as StarIcon,
  ShoppingCart as ShoppingCartIcon,
  RemoveRedEye as RemoveRedEyeIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { Anuncio, FiltrosAnuncios } from './types';

interface AnunciosTableProps {
  anuncios: Anuncio[];
  filtros?: FiltrosAnuncios;
  onAnuncioClick?: (anuncio: Anuncio) => void;
  onAnuncioEdit?: (anuncio: Anuncio) => void;
  onAnuncioAction?: (anuncio: Anuncio, action: string) => void;
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
}

type OrderBy = keyof Anuncio;
type Order = 'asc' | 'desc';

const AnunciosTable: React.FC<AnunciosTableProps> = ({
  anuncios,
  filtros = {},
  onAnuncioClick,
  onAnuncioEdit,
  onAnuncioAction,
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('relevancia');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAnuncio, setSelectedAnuncio] = useState<Anuncio | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'gold_pro':
        return 'warning';
      case 'gold_special':
        return 'secondary';
      case 'premium':
        return 'primary';
      case 'classic':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ativo':
        return 'success';
      case 'pausado':
        return 'warning';
      case 'finalizado':
        return 'info';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRelevanciaColor = (relevancia: number) => {
    if (relevancia >= 80) return 'success';
    if (relevancia >= 60) return 'warning';
    return 'error';
  };

  // Filtrar anúncios
  const filteredAnuncios = useMemo(() => {
    return anuncios.filter(anuncio => {
      if (filtros.categoria && anuncio.categoria !== filtros.categoria) return false;
      if (filtros.tipo && anuncio.tipo !== filtros.tipo) return false;
      if (filtros.status && anuncio.status !== filtros.status) return false;
      if (filtros.promocao !== undefined && anuncio.promocao !== filtros.promocao) return false;
      if (filtros.precoMin && anuncio.preco < filtros.precoMin) return false;
      if (filtros.precoMax && anuncio.preco > filtros.precoMax) return false;
      if (filtros.estoqueMin && anuncio.estoque < filtros.estoqueMin) return false;
      if (filtros.relevanciaMin && anuncio.relevancia < filtros.relevanciaMin) return false;
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        return (
          anuncio.titulo.toLowerCase().includes(busca) ||
          anuncio.categoria.toLowerCase().includes(busca) ||
          anuncio.mlb_id?.toLowerCase().includes(busca)
        );
      }
      return true;
    });
  }, [anuncios, filtros]);

  // Ordenar anúncios
  const sortedAnuncios = useMemo(() => {
    return [...filteredAnuncios].sort((a, b) => {
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
  }, [filteredAnuncios, order, orderBy]);

  // Anúncios da página atual
  const paginatedAnuncios = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedAnuncios.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedAnuncios, page, rowsPerPage]);

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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, anuncio: Anuncio) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedAnuncio(anuncio);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAnuncio(null);
  };

  const handleMenuAction = (action: string) => {
    if (selectedAnuncio && onAnuncioAction) {
      onAnuncioAction(selectedAnuncio, action);
    }
    handleMenuClose();
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      if (event.target.checked) {
        const allIds = paginatedAnuncios.map(a => a.id);
        onSelectionChange([...new Set([...selectedIds, ...allIds])]);
      } else {
        const pageIds = paginatedAnuncios.map(a => a.id);
        onSelectionChange(selectedIds.filter(id => !pageIds.includes(id)));
      }
    }
  };

  const handleSelectAnuncio = (anuncioId: number) => {
    if (onSelectionChange) {
      if (selectedIds.includes(anuncioId)) {
        onSelectionChange(selectedIds.filter(id => id !== anuncioId));
      } else {
        onSelectionChange([...selectedIds, anuncioId]);
      }
    }
  };

  const isSelected = (id: number) => selectedIds.includes(id);
  const isAllSelected = paginatedAnuncios.length > 0 && 
    paginatedAnuncios.every(anuncio => selectedIds.includes(anuncio.id));
  const isIndeterminate = paginatedAnuncios.some(anuncio => selectedIds.includes(anuncio.id)) && 
    !isAllSelected;

  return (
    <Paper sx={{ mt: 2 }}>
      {loading && <LinearProgress />}
      
      {/* Cards de resumo */}
      <Box p={2}>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Box flex="1" minWidth="250px">
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <LocalOfferIcon color="primary" sx={{ fontSize: '2rem', mb: 1 }} />
                <Typography variant="h6">{formatNumber(anuncios.length)}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Total de Anúncios
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1" minWidth="250px">
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ShoppingCartIcon color="success" sx={{ fontSize: '2rem', mb: 1 }} />
                <Typography variant="h6">
                  {formatNumber(anuncios.reduce((sum, a) => sum + a.vendas, 0))}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total de Vendas
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1" minWidth="250px">
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AttachMoneyIcon color="warning" sx={{ fontSize: '2rem', mb: 1 }} />
                <Typography variant="h6">
                  {formatCurrency(anuncios.reduce((sum, a) => sum + (a.preco * a.vendas), 0))}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Receita Total
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box flex="1" minWidth="250px">
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <StarIcon color="info" sx={{ fontSize: '2rem', mb: 1 }} />
                <Typography variant="h6">
                  {(anuncios.reduce((sum, a) => sum + a.relevancia, 0) / anuncios.length || 0).toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Relevância Média
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
      
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              <TableCell>Anúncio</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'categoria'}
                  direction={orderBy === 'categoria' ? order : 'asc'}
                  onClick={() => handleRequestSort('categoria')}
                >
                  Categoria
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'preco'}
                  direction={orderBy === 'preco' ? order : 'asc'}
                  onClick={() => handleRequestSort('preco')}
                >
                  Preço
                </TableSortLabel>
              </TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'vendas'}
                  direction={orderBy === 'vendas' ? order : 'asc'}
                  onClick={() => handleRequestSort('vendas')}
                >
                  Vendas
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'visitas'}
                  direction={orderBy === 'visitas' ? order : 'asc'}
                  onClick={() => handleRequestSort('visitas')}
                >
                  Visitas
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'relevancia'}
                  direction={orderBy === 'relevancia' ? order : 'asc'}
                  onClick={() => handleRequestSort('relevancia')}
                >
                  Relevância
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'estoque'}
                  direction={orderBy === 'estoque' ? order : 'asc'}
                  onClick={() => handleRequestSort('estoque')}
                >
                  Estoque
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAnuncios.map((anuncio) => (
              <TableRow
                key={anuncio.id}
                hover
                onClick={() => onAnuncioClick?.(anuncio)}
                sx={{ cursor: 'pointer' }}
                selected={isSelected(anuncio.id)}
              >
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected(anuncio.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectAnuncio(anuncio.id);
                      }}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={anuncio.imagem}
                      variant="rounded"
                      sx={{ width: 50, height: 50 }}
                    >
                      {anuncio.titulo[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: 200 }}>
                        {anuncio.titulo}
                      </Typography>
                      {anuncio.mlb_id && (
                        <Typography variant="caption" color="textSecondary">
                          MLB: {anuncio.mlb_id}
                        </Typography>
                      )}
                      {anuncio.promocao && (
                        <Chip 
                          label="PROMOÇÃO" 
                          size="small" 
                          color="error" 
                          sx={{ ml: 1, fontSize: '0.6rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={anuncio.categoria}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(anuncio.preco)}
                    </Typography>
                    {anuncio.desconto > 0 && (
                      <Typography variant="caption" color="success.main">
                        -{anuncio.desconto}%
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={anuncio.tipo.replace('_', ' ').toUpperCase()}
                    size="small"
                    color={getTipoColor(anuncio.tipo) as any}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <ShoppingCartIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formatNumber(anuncio.vendas)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <RemoveRedEyeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formatNumber(anuncio.visitas)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Chip
                      label={`${anuncio.relevancia}%`}
                      size="small"
                      color={getRelevanciaColor(anuncio.relevancia) as any}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    color={anuncio.estoque < 5 ? 'error' : 'inherit'}
                    fontWeight={anuncio.estoque < 5 ? 'bold' : 'normal'}
                  >
                    {formatNumber(anuncio.estoque)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center">
                    <Tooltip title="Visualizar">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnuncioClick?.(anuncio);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnuncioEdit?.(anuncio);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mais opções">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, anuncio)}
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
        count={filteredAnuncios.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Anúncios por página:"
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
          <ListItemText>Visualizar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        {selectedAnuncio?.url_anuncio && (
          <MenuItem onClick={() => handleMenuAction('open_ml')}>
            <ListItemIcon>
              <LaunchIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Ver no ML</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleMenuAction('duplicate')}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicar</ListItemText>
        </MenuItem>
        {selectedAnuncio?.status === 'ativo' ? (
          <MenuItem onClick={() => handleMenuAction('pause')}>
            <ListItemIcon>
              <PauseIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Pausar</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleMenuAction('activate')}>
            <ListItemIcon>
              <PlayArrowIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Ativar</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default AnunciosTable;
