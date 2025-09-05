import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  Button,
  Chip,
  IconButton,
  Paper
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  NotificationsActive,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const CompetitorIntelligence: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  const competitors = [
    {
      id: 1,
      name: 'Competitor A',
      price: 1980,
      trend: 'up',
      marketShare: '15%',
      rating: 4.2
    },
    {
      id: 2,
      name: 'Competitor B',
      price: 1950,
      trend: 'down',
      marketShare: '12%',
      rating: 4.0
    },
    {
      id: 3,
      name: 'Competitor C',
      price: 2100,
      trend: 'up',
      marketShare: '18%',
      rating: 4.5
    }
  ];

  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: darkMode ? '#121212' : '#f5f5f5',
      minHeight: '100vh',
      color: darkMode ? '#fff' : '#000'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Inteligência Competitiva
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LightMode />
          <Switch
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
          <DarkMode />
        </Box>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 2, 
        mb: 3 
      }}>
        <Card sx={{ bgcolor: darkMode ? '#1e1e1e' : '#fff' }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              Preço Médio do Mercado
            </Typography>
            <Typography variant="h4">R$ 2.010</Typography>
            <Chip 
              label="+2.5%" 
              color="success" 
              size="small" 
              icon={<TrendingUp />} 
            />
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: darkMode ? '#1e1e1e' : '#fff' }}>
          <CardContent>
            <Typography variant="h6" color="secondary">
              Seu Posicionamento
            </Typography>
            <Typography variant="h4">2º Lugar</Typography>
            <Chip 
              label="Competitivo" 
              color="warning" 
              size="small" 
            />
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: darkMode ? '#1e1e1e' : '#fff' }}>
          <CardContent>
            <Typography variant="h6" color="error">
              Alertas Ativos
            </Typography>
            <Typography variant="h4">3</Typography>
            <Chip 
              label="Urgente" 
              color="error" 
              size="small" 
              icon={<NotificationsActive />} 
            />
          </CardContent>
        </Card>
      </Box>

      {/* Competitors List */}
      <Paper sx={{ 
        p: 3, 
        bgcolor: darkMode ? '#1e1e1e' : '#fff',
        mb: 3
      }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          Monitoramento de Concorrentes
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {competitors.map((competitor) => (
            <motion.div
              key={competitor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: competitor.id * 0.1 }}
            >
              <Card sx={{ 
                bgcolor: darkMode ? '#2a2a2a' : '#f9f9f9',
                border: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`
              }}>
                <CardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <Box>
                      <Typography variant="h6">
                        {competitor.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Market Share: {competitor.marketShare} | Rating: {competitor.rating}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        R$ {competitor.price.toLocaleString()}
                      </Typography>
                      
                      <IconButton color={competitor.trend === 'up' ? 'error' : 'success'}>
                        {competitor.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                      </IconButton>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                      >
                        Detalhes
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      </Paper>

      {/* Price Gap Analysis */}
      <Paper sx={{ 
        p: 3, 
        bgcolor: darkMode ? '#1e1e1e' : '#fff'
      }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          Análise de Gap de Preços
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 2 
        }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: darkMode ? '#2a2a2a' : '#f5f7fa', 
            borderRadius: 2 
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Seu Preço
            </Typography>
            <Typography variant="h6">R$ 1.970</Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: darkMode ? '#2a2a2a' : '#f5f7fa', 
            borderRadius: 2 
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Concorrente Mais Próximo
            </Typography>
            <Typography variant="h6">R$ 1.980</Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: darkMode ? '#2a2a2a' : '#f5f7fa', 
            borderRadius: 2 
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Diferença
            </Typography>
            <Typography variant="h6" color="success.main">-R$ 10</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CompetitorIntelligence;
