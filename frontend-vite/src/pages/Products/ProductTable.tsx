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
  FormControlLabel
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
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { Produto, FiltrosProdutos } from './types';

interface ProductTableProps {
  produtos: Produto[];
  filtros?: FiltrosProdutos;
  onProductClick?: (produto: Produto) => void;
  onProductEdit?: (produto: Produto) => void;
  onProductAction?: (produto: Produto, action: string) => void;
  onSelect?: (produto: Produto) => void;
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

type OrderBy = keyof Produto;
type Order = 'asc' | 'desc';

const ProductTable: React.FC<ProductTableProps> = ({
  produtos = [],
  filtros = {},
  onProductClick,
  onProductEdit,
  onProductAction,
  onSelect,
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('vendas');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'success';
      case 'Pausado':
        return 'warning';
      case 'Inativo':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoiColor = (roi: number) => {
    if (roi > 15) return 'success';
    if (roi > 10) return 'warning';
    if (roi > 5) return 'info';
    return 'error';
  };

  const getSazonalidadeIcon = (sazonalidade: string) => {
    switch (sazonalidade) {
      case 'Alta':
        return <TrendingUpIcon fontSize="small" color="success" />;
      case 'Baixa':
        return <TrendingDownIcon fontSize="small" color="error" />;
      default:
        return <TrendingUpIcon fontSize="small" color="warning" />;
    }
  };

  // Filtrar produtos
  const filteredProdutos = useMemo(() => {
    if (!produtos || produtos.length === 0) return [];
    
    return produtos.filter(produto => {
      if (!produto) return false;
      if (filtros.categoria && produto.categoria !== filtros.categoria) return false;
      if (filtros.status && produto.status !== filtros.status) return false;
      if (filtros.precoMin && produto.preco < filtros.precoMin) return false;
      if (filtros.precoMax && produto.preco > filtros.precoMax) return false;
      if (filtros.estoqueMin && produto.estoque < filtros.estoqueMin) return false;
      if (filtros.roiMin && produto.roi < filtros.roiMin) return false;
      if (filtros.sazonalidade && produto.sazonalidade !== filtros.sazonalidade) return false;
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        return (
          produto.nome?.toLowerCase().includes(busca) ||
          produto.categoria?.toLowerCase().includes(busca) ||
          produto.sku?.toLowerCase().includes(busca) ||
          produto.marca?.toLowerCase().includes(busca)
        );
      }
      return true;
    });
  }, [produtos, filtros]);

  // Ordenar produtos
  const sortedProdutos = useMemo(() => {
    return [...filteredProdutos].sort((a, b) => {
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
  }, [filteredProdutos, order, orderBy]);

  // Produtos da página atual
  const paginatedProdutos = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedProdutos.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedProdutos, page, rowsPerPage]);

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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, produto: Produto) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedProduct(produto);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleMenuAction = (action: string) => {
    if (selectedProduct && onProductAction) {
      onProductAction(selectedProduct, action);
    }
    handleMenuClose();
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      if (event.target.checked) {
        const allIds = paginatedProdutos.map(p => p.id);
        onSelectionChange([...new Set([...selectedIds, ...allIds])]);
      } else {
        const pageIds = paginatedProdutos.map(p => p.id);
        onSelectionChange(selectedIds.filter(id => !pageIds.includes(id)));
      }
    }
  };

  const handleSelectProduct = (produtoId: string) => {
    if (onSelectionChange) {
      if (selectedIds.includes(produtoId)) {
        onSelectionChange(selectedIds.filter(id => id !== produtoId));
      } else {
        onSelectionChange([...selectedIds, produtoId]);
      }
    }
  };

  const isSelected = (id: string) => selectedIds.includes(id);
  const isAllSelected = paginatedProdutos.length > 0 && 
    paginatedProdutos.every(produto => selectedIds.includes(produto.id));
  const isIndeterminate = paginatedProdutos.some(produto => selectedIds.includes(produto.id)) && 
    !isAllSelected;

  return (
    <Paper>
      {loading && <LinearProgress />}
      
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
              <TableCell>Produto</TableCell>
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
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'roi'}
                  direction={orderBy === 'roi' ? order : 'asc'}
                  onClick={() => handleRequestSort('roi')}
                >
                  ROI
                </TableSortLabel>
              </TableCell>
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
                  active={orderBy === 'estoque'}
                  direction={orderBy === 'estoque' ? order : 'asc'}
                  onClick={() => handleRequestSort('estoque')}
                >
                  Estoque
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sazonalidade</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProdutos.map((produto) => (
              <TableRow
                key={produto.id}
                hover
                onClick={() => {
                  if (onProductClick) onProductClick(produto);
                  if (onSelect) onSelect(produto);
                }}
                sx={{ cursor: 'pointer' }}
                selected={isSelected(produto.id)}
              >
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected(produto.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectProduct(produto.id);
                      }}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={produto.imagem || undefined}
                      variant="rounded"
                      sx={{ width: 40, height: 40 }}
                    >
                      {produto.nome[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {produto.nome}
                      </Typography>
                      {produto.sku && (
                        <Typography variant="caption" color="textSecondary">
                          SKU: {produto.sku}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={produto.categoria}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(produto.preco)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${produto.roi}%`}
                    size="small"
                    color={getRoiColor(produto.roi) as any}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatNumber(produto.vendas)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color={produto.estoque < 10 ? 'error' : 'inherit'}>
                    {formatNumber(produto.estoque)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={produto.status}
                    size="small"
                    color={getStatusColor(produto.status) as any}
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {getSazonalidadeIcon(produto.sazonalidade)}
                    <Typography variant="caption">
                      {produto.sazonalidade}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center">
                    <Tooltip title="Visualizar">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onProductClick) onProductClick(produto);
                          if (onSelect) onSelect(produto);
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
                          onProductEdit(produto);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mais opções">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, produto)}
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
        count={filteredProdutos.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Produtos por página:"
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
        {selectedProduct?.url_mercadolivre && (
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
        {selectedProduct?.status === 'Ativo' ? (
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

export default ProductTable;
