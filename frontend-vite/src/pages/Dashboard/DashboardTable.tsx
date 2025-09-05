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
  LinearProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

interface DashboardTableItem {
  id: string;
  name: string;
  category: string;
  value: number;
  change: number;
  status: 'up' | 'down' | 'stable';
  progress?: number;
  icon?: React.ReactNode;
}

interface DashboardTableProps {
  title?: string;
  data: DashboardTableItem[];
  loading?: boolean;
  onItemClick?: (item: DashboardTableItem) => void;
}

type OrderBy = keyof DashboardTableItem;
type Order = 'asc' | 'desc';

const DashboardTable: React.FC<DashboardTableProps> = ({
  title = 'Dados do Dashboard',
  data,
  loading = false,
  onItemClick
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('value');

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <TrendingUpIcon fontSize="small" color="success" />;
      case 'down':
        return <TrendingDownIcon fontSize="small" color="error" />;
      default:
        return null;
    }
  };

  // Ordenar dados
  const sortedData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return [...data].sort((a, b) => {
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
  }, [data, order, orderBy]);

  // Dados da página atual
  const paginatedData = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

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
      
      {title && (
        <Box p={2} borderBottom={1} borderColor="divider">
          <Typography variant="h6">{title}</Typography>
        </Box>
      )}
      
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'category'}
                  direction={orderBy === 'category' ? order : 'asc'}
                  onClick={() => handleRequestSort('category')}
                >
                  Categoria
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'value'}
                  direction={orderBy === 'value' ? order : 'asc'}
                  onClick={() => handleRequestSort('value')}
                >
                  Valor
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'change'}
                  direction={orderBy === 'change' ? order : 'asc'}
                  onClick={() => handleRequestSort('change')}
                >
                  Variação
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Progresso</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow
                key={item.id}
                hover
                onClick={() => onItemClick?.(item)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {item.icon && (
                      <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                        {item.icon}
                      </Avatar>
                    )}
                    <Typography variant="body2" fontWeight="medium">
                      {item.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.category}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {formatNumber(item.value)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {getStatusIcon(item.status)}
                    <Typography 
                      variant="body2" 
                      color={getStatusColor(item.status) + '.main'}
                      fontWeight="medium"
                    >
                      {formatPercentage(item.change)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.status.toUpperCase()}
                    size="small"
                    color={getStatusColor(item.status) as any}
                  />
                </TableCell>
                <TableCell>
                  {item.progress !== undefined && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress 
                        variant="determinate" 
                        value={item.progress}
                        sx={{ width: 60, height: 6 }}
                      />
                      <Typography variant="caption">
                        {item.progress.toFixed(0)}%
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver detalhes">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemClick?.(item);
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Itens por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
      />
    </Paper>
  );
};

export default DashboardTable;
