import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardChartProps {
  title?: string;
  type: 'line' | 'area' | 'bar' | 'pie';
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardChart: React.FC<DashboardChartProps> = ({
  title,
  type,
  data,
  dataKey,
  xAxisKey = 'name',
  color,
  height = 300,
  showLegend = true,
  showGrid = true
}) => {
  const theme = useTheme();
  const primaryColor = color || theme.palette.primary.main;

  const renderChart = () => {
    const commonProps = {
      width: '100%',
      height,
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={primaryColor}
                strokeWidth={2}
                dot={{ fill: primaryColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={primaryColor}
                fill={primaryColor}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              <Bar dataKey={dataKey} fill={primaryColor} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      {title && (
        <CardHeader title={title} titleTypographyProps={{ variant: 'h6' }} />
      )}
      <CardContent>
        <Box sx={{ width: '100%' }}>
          {renderChart()}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardChart;
