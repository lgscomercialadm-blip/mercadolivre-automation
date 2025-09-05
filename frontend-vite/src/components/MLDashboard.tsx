import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Grid,
  Box,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const API_BASE = 'http://localhost:8001';

const MLDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [mlStatus, setMLStatus] = useState('checking');
  const [apiResults, setApiResults] = useState({});

  useEffect(() => {
    checkAuthentication();
    checkBackendStatus();
  }, []);

  const checkAuthentication = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      setIsAuthenticated(true);
      window.history.replaceState({}, document.title, "/");
    }

    setLoading(false);
  };

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        setBackendStatus('online');
        checkMLStatus();
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  const checkMLStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/ml/status`);
      const data = await response.json();
      setMLStatus(data.status === 'connected' ? 'online' : 'blocked');
    } catch (error) {
      setMLStatus('offline');
    }
  };

  const startOAuth = () => {
    window.location.href = `${API_BASE}/auth/oauth`;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setApiResults({});
    window.history.replaceState({}, document.title, "/");
  };

  const testAPI = async (endpoint, label) => {
    setApiResults(prev => ({...prev, [label]: 'loading'}));

    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      const data = await response.json();
      setApiResults(prev => ({...prev, [label]: data}));
    } catch (error) {
      setApiResults(prev => ({...prev, [label]: {error: error.message}}));
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      online: { color: 'success', icon: <CheckCircleIcon />, label: 'Online' },
      offline: { color: 'error', icon: <ErrorIcon />, label: 'Offline' },
      blocked: { color: 'warning', icon: <ErrorIcon />, label: 'Bloqueado' },
      checking: { color: 'default', icon: null, label: 'Verificando...' }
    };

    const config = statusConfig[status] || statusConfig.checking;
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Carregando sistema...
        </Typography>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Sistema ML Integration
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h4" gutterBottom>
                🚀 Sistema ML Integration
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Faça login com sua conta do Mercado Livre para acessar todas as funcionalidades
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="body2">Backend:</Typography>
                  {getStatusChip(backendStatus)}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Typography variant="body2">ML API:</Typography>
                  {getStatusChip(mlStatus)}
                </Box>
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                onClick={startOAuth}
                disabled={backendStatus !== 'online'}
                sx={{ mb: 3 }}
              >
                Fazer Login com Mercado Livre
              </Button>

              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" display="block">
                  ✅ OAuth2 + PKCE Security
                </Typography>
                <Typography variant="caption" display="block">
                  ✅ Client ID: 6377568852501213
                </Typography>
                <Typography variant="caption" display="block">
                  ✅ Produção Ready
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🎉 Sistema ML - Autenticado
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6">
            🚀 Sistema Totalmente Funcional!
          </Typography>
          Autenticação OAuth2 realizada com sucesso. Todas as funcionalidades estão disponíveis.
        </Alert>

        <Typography variant="h4" gutterBottom>
          🔧 Funcionalidades Disponíveis
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={2}>
          <Box flex="1" minWidth="250px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📁 Categorias ML
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Buscar todas as categorias disponíveis no Mercado Livre
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => testAPI('/ml/categories', 'categories')}
                  disabled={apiResults.categories === 'loading'}
                >
                  {apiResults.categories === 'loading' ? <CircularProgress size={20} /> : 'Buscar Categorias'}
                </Button>
                {apiResults.categories && apiResults.categories !== 'loading' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                    <pre style={{ fontSize: '12px' }}>
                      {JSON.stringify(apiResults.categories, null, 2)}
                    </pre>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box flex="1" minWidth="250px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🔍 Buscar Produtos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Pesquisar produtos no marketplace
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => testAPI('/ml/search?q=notebook', 'search')}
                  disabled={apiResults.search === 'loading'}
                >
                  {apiResults.search === 'loading' ? <CircularProgress size={20} /> : 'Buscar "notebook"'}
                </Button>
                {apiResults.search && apiResults.search !== 'loading' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                    <pre style={{ fontSize: '12px' }}>
                      {JSON.stringify(apiResults.search, null, 2)}
                    </pre>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box flex="1" minWidth="250px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📦 Detalhes Produto
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Obter informações detalhadas de produtos
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => testAPI('/ml/products/MLB123456', 'product')}
                  disabled={apiResults.product === 'loading'}
                >
                  {apiResults.product === 'loading' ? <CircularProgress size={20} /> : 'Produto Exemplo'}
                </Button>
                {apiResults.product && apiResults.product !== 'loading' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                    <pre style={{ fontSize: '12px' }}>
                      {JSON.stringify(apiResults.product, null, 2)}
                    </pre>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box flex="1" minWidth="250px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ⚡ Status Sistema
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Verificar conectividade e status das APIs
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => testAPI('/test/cloudfront', 'status')}
                  disabled={apiResults.status === 'loading'}
                >
                  {apiResults.status === 'loading' ? <CircularProgress size={20} /> : 'Testar Conectividade'}
                </Button>
                {apiResults.status && apiResults.status !== 'loading' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                    <pre style={{ fontSize: '12px' }}>
                      {JSON.stringify(apiResults.status, null, 2)}
                    </pre>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            🎯 Próximas Funcionalidades
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Box flex="1" minWidth="250px">
              <Typography variant="body2">• Gerenciamento de anúncios</Typography>
              <Typography variant="body2">• Análise de vendas</Typography>
              <Typography variant="body2">• Automação de campanhas</Typography>
            </Box>
            <Box flex="1" minWidth="250px">
              <Typography variant="body2">• Webhooks ML</Typography>
              <Typography variant="body2">• Relatórios avançados</Typography>
              <Typography variant="body2">• Dashboard de métricas</Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default MLDashboard;
