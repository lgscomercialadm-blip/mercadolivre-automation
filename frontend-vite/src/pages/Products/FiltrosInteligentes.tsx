import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

interface FiltrosInteligentesProps {
  onFiltersChange?: (filters: any) => void;
}

const FiltrosInteligentes: React.FC<FiltrosInteligentesProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({
    categoria: '',
    preco: [0, 10000],
    condicao: '',
    estoque: [0, 1000],
    vendas: [0, 500],
    rating: [0, 5],
    frete: '',
    promocao: false,
    destaque: false
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const categorias = [
    'Informática',
    'Celulares e Telefones',
    'Casa e Decoração',
    'Esportes e Fitness',
    'Moda e Beleza',
    'Eletrodomésticos',
    'Games',
    'Livros'
  ];

  const condicoes = [
    { value: 'new', label: 'Novo' },
    { value: 'used', label: 'Usado' },
    { value: 'refurbished', label: 'Recondicionado' }
  ];

  const tiposFrete = [
    { value: 'free', label: 'Frete Grátis' },
    { value: 'full', label: 'Mercado Envios Full' },
    { value: 'flex', label: 'Mercado Envios Flex' }
  ];

  const handleFilterChange = (filterName: string, value: any) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    
    // Atualizar filtros ativos
    const active = Object.entries(newFilters)
      .filter(([key, val]) => {
        if (Array.isArray(val)) {
          return val[0] > 0 || val[1] < getMaxValue(key);
        }
        return val !== '' && val !== false;
      })
      .map(([key]) => key);
    
    setActiveFilters(active);
    
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const getMaxValue = (filterType: string) => {
    const maxValues: { [key: string]: number } = {
      preco: 10000,
      estoque: 1000,
      vendas: 500,
      rating: 5
    };
    return maxValues[filterType] || 100;
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      categoria: '',
      preco: [0, 10000],
      condicao: '',
      estoque: [0, 1000],
      vendas: [0, 500],
      rating: [0, 5],
      frete: '',
      promocao: false,
      destaque: false
    };
    setFilters(clearedFilters);
    setActiveFilters([]);
    
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  };

  const removeFilter = (filterName: string) => {
    const defaultValue = Array.isArray(filters[filterName as keyof typeof filters]) 
      ? [0, getMaxValue(filterName)]
      : filterName === 'promocao' || filterName === 'destaque' 
        ? false 
        : '';
    
    handleFilterChange(filterName, defaultValue);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Filtros Inteligentes</Typography>
          </Box>
          {activeFilters.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearAllFilters}
            >
              Limpar Todos
            </Button>
          )}
        </Box>

        {/* Filtros Ativos */}
        {activeFilters.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Filtros ativos:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {activeFilters.map((filterName) => (
                <Chip
                  key={filterName}
                  label={filterName}
                  onDelete={() => removeFilter(filterName)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Filtros Básicos */}
          <Box>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Filtros Básicos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box flex="1" minWidth="250px">
                    <FormControl fullWidth>
                      <InputLabel>Categoria</InputLabel>
                      <Select
                        value={filters.categoria}
                        onChange={(e) => handleFilterChange('categoria', e.target.value)}
                        label="Categoria"
                      >
                        <MenuItem value="">Todas</MenuItem>
                        {categorias.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {cat}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box flex="1" minWidth="250px">
                    <FormControl fullWidth>
                      <InputLabel>Condição</InputLabel>
                      <Select
                        value={filters.condicao}
                        onChange={(e) => handleFilterChange('condicao', e.target.value)}
                        label="Condição"
                      >
                        <MenuItem value="">Todas</MenuItem>
                        {condicoes.map((cond) => (
                          <MenuItem key={cond.value} value={cond.value}>
                            {cond.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box flex="1" minWidth="250px">
                    <FormControl fullWidth>
                      <InputLabel>Frete</InputLabel>
                      <Select
                        value={filters.frete}
                        onChange={(e) => handleFilterChange('frete', e.target.value)}
                        label="Frete"
                      >
                        <MenuItem value="">Todos</MenuItem>
                        {tiposFrete.map((frete) => (
                          <MenuItem key={frete.value} value={frete.value}>
                            {frete.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Filtros de Valor */}
          <Box>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Filtros de Valor</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box flex="1" minWidth="300px">
                    <Typography gutterBottom>
                      Preço: R$ {filters.preco[0]} - R$ {filters.preco[1]}
                    </Typography>
                    <Slider
                      value={filters.preco}
                      onChange={(_, value) => handleFilterChange('preco', value)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={10000}
                      step={50}
                    />
                  </Box>

                  <Box flex="1" minWidth="300px">
                    <Typography gutterBottom>
                      Estoque: {filters.estoque[0]} - {filters.estoque[1]} unidades
                    </Typography>
                    <Slider
                      value={filters.estoque}
                      onChange={(_, value) => handleFilterChange('estoque', value)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={1000}
                      step={10}
                    />
                  </Box>

                  <Box flex="1" minWidth="300px">
                    <Typography gutterBottom>
                      Vendas: {filters.vendas[0]} - {filters.vendas[1]} por mês
                    </Typography>
                    <Slider
                      value={filters.vendas}
                      onChange={(_, value) => handleFilterChange('vendas', value)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={500}
                      step={5}
                    />
                  </Box>

                  <Box flex="1" minWidth="300px">
                    <Typography gutterBottom>
                      Rating: {filters.rating[0]} - {filters.rating[1]} estrelas
                    </Typography>
                    <Slider
                      value={filters.rating}
                      onChange={(_, value) => handleFilterChange('rating', value)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={5}
                      step={0.1}
                    />
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Filtros Especiais */}
          <Box>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Filtros Especiais</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box flex="1" minWidth="300px">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={filters.promocao}
                          onChange={(e) => handleFilterChange('promocao', e.target.checked)}
                        />
                      }
                      label="Em Promoção"
                    />
                  </Box>

                  <Box flex="1" minWidth="300px">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={filters.destaque}
                          onChange={(e) => handleFilterChange('destaque', e.target.checked)}
                        />
                      }
                      label="Produto em Destaque"
                    />
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FiltrosInteligentes;
