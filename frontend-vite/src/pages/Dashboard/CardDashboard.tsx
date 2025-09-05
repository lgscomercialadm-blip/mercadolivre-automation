import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

interface CardDashboardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
}

const CardDashboard: React.FC<CardDashboardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend = 'neutral',
  trendValue,
  color = 'primary',
  onClick
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon fontSize="small" color="success" />;
      case 'down':
        return <TrendingDownIcon fontSize="small" color="error" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`} fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
            {trendValue && (
              <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: 1 }}>
                {getTrendIcon()}
                <Typography 
                  variant="body2" 
                  color={getTrendColor()}
                  fontWeight="medium"
                >
                  {trendValue}
                </Typography>
              </Box>
            )}
          </Box>
          <Box>
            {icon && (
              <Avatar 
                sx={{ 
                  bgcolor: `${color}.light`, 
                  color: `${color}.main`,
                  width: 48,
                  height: 48
                }}
              >
                {icon}
              </Avatar>
            )}
            {onClick && (
              <Tooltip title="Ver detalhes">
                <IconButton size="small" sx={{ mt: 1 }}>
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CardDashboard;
