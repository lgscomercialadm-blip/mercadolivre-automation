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
  Box,
  Typography,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';

interface PriceHistoryEntry {
  id: string;
  produto_nome: string;
  produto_imagem?: string;
  concorrente_nome: string;
  preco_atual: number;
  preco_anterior: number;
  preco_menor_30d: number;
  preco_maior_30d: number;
  variacao_percentual: number;
  data_atualizacao: string;
  tendencia: 'up' | 'down' | 'stable';
  disponibilidade: boolean;
  posicao_ranking: number;
}

interface PriceHistoryTableProps {
  priceHistory: PriceHistoryEntry[];
  loading?: boolean;
  onEntryClick?: (entry: PriceHistoryEntry) => void;
}

type OrderBy = keyof PriceHistoryEntry;
type Order = 'asc' | 'desc';

const PriceHistoryTable: React.FC<PriceHistoryTableProps> = ({
  priceHistory,
  loading = false,
  onEntryClick
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('data_atualizacao');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrendIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up':
        return <TrendingUpIcon fontSize="small" color="error" />;
      case 'down':
        return <TrendingDownIcon fontSize="small" color="success" />;
      default:
        return <TrendingFlatIcon fontSize="small" color="action" />;
    }
  };

  const getTrendColor = (variacao: number) => {
    if (variacao > 5) return 'error.main';
    if (variacao < -5) return 'success.main';
    return 'text.secondary';
  };

  const getVariationChip = (variacao: number) => {
    const isPositive = variacao > 0;
    const color = variacao > 5 ? 'error' : variacao < -5 ? 'success' : 'default';
    
    return (
      <Chip
        label={`${isPositive ? '+' : ''}${variacao.toFixed(1)}%`}
        size="small"
        color={color as any}
        icon={getTrendIcon(variacao > 0 ? 'up' : variacao < 0 ? 'down' : 'stable')}
      />
    );
  };

  // Ordenar histórico
  const sortedHistory = React.useMemo(() => {
    return [...priceHistory].sort((a, b) => {
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
  }, [priceHistory, order, orderBy]);

  // Entradas da página atual
  const paginatedHistory = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedHistory.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedHistory, page, rowsPerPage]);

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

  return (
    <Paper>
      {loading && <LinearProgress />}
      
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell>Concorrente</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'preco_atual'}
                  direction={orderBy === 'preco_atual' ? order : 'asc'}
                  onClick={() => handleRequestSort('preco_atual')}
                >
                  Preço Atual
                </TableSortLabel>
              </TableCell>
              <TableCell>Preço Anterior</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'variacao_percentual'}
                  direction={orderBy === 'variacao_percentual' ? order : 'asc'}
                  onClick={() => handleRequestSort('variacao_percentual')}
                >
                  Variação
                </TableSortLabel>
              </TableCell>
              <TableCell>Faixa 30 Dias</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'posicao_ranking'}
                  direction={orderBy === 'posicao_ranking' ? order : 'asc'}
                  onClick={() => handleRequestSort('posicao_ranking')}
                >
                  Posição
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'data_atualizacao'}
                  direction={orderBy === 'data_atualizacao' ? order : 'asc'}
                  onClick={() => handleRequestSort('data_atualizacao')}
                >
                  Última Atualização
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedHistory.map((entry) => (
              <TableRow
                key={entry.id}
                hover
                onClick={() => onEntryClick?.(entry)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={entry.produto_imagem}
                      variant="rounded"
                      sx={{ width: 40, height: 40 }}
                    >
                      {entry.produto_nome[0]}
                    </Avatar>
                    <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: 150 }}>
                      {entry.produto_nome}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {entry.concorrente_nome}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(entry.preco_atual)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {formatCurrency(entry.preco_anterior)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {getVariationChip(entry.variacao_percentual)}
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="caption" color="success.main">
                      Min: {formatCurrency(entry.preco_menor_30d)}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="error.main">
                      Max: {formatCurrency(entry.preco_maior_30d)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={`#${entry.posicao_ranking}`}
                    size="small"
                    color={entry.posicao_ranking <= 3 ? 'success' : 
                           entry.posicao_ranking <= 10 ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={entry.disponibilidade ? 'Disponível' : 'Sem estoque'}
                    size="small"
                    color={entry.disponibilidade ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="textSecondary">
                    {formatDate(entry.data_atualizacao)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver histórico completo">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEntryClick?.(entry);
                      }}
                    >
                      <ShowChartIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={priceHistory.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Entradas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
      />
    </Paper>
  );
};

export default PriceHistoryTable;
