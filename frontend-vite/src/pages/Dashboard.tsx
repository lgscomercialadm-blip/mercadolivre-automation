// Dashboard principal da pasta pages

import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import CardDashboard from "./Dashboard/CardDashboard";
import DashboardChart from "./Dashboard/DashboardChart";
import DashboardModal from "./Dashboard/DashboardModal";
import DashboardTable from "./Dashboard/DashboardTable";
import OAuthLogin from "../components/OAuthLogin";
import type { DashboardChartData, DashboardMetric } from "./Dashboard/types";

const metrics: DashboardMetric[] = [
	{ id: 1, label: "Vendas", value: 1200, unit: "R$" },
	{ id: 2, label: "Conversões", value: 300, unit: "" },
	{ id: 3, label: "Visitantes", value: 5000, unit: "" },
];

const chartData: DashboardChartData[] = [
	{ label: "Jan", value: 400 },
	{ label: "Fev", value: 800 },
	{ label: "Mar", value: 600 },
];

const tableData = [
	{
		id: "1",
		name: "Produto A",
		category: "Eletrônicos",
		value: 1250.99,
		change: 12.5,
		status: "up" as const,
		progress: 75
	},
	{
		id: "2", 
		name: "Produto B",
		category: "Casa & Jardim",
		value: 899.50,
		change: -5.2,
		status: "down" as const,
		progress: 45
	},
	{
		id: "3",
		name: "Produto C", 
		category: "Moda",
		value: 2100.00,
		change: 8.7,
		status: "up" as const,
		progress: 90
	}
];

const Dashboard: React.FC = () => {
	const [modalOpen, setModalOpen] = React.useState(false);
	const [selectedMetric, setSelectedMetric] =
		React.useState<DashboardMetric | null>(null);

	const handleCardClick = (metric: DashboardMetric) => {
		setSelectedMetric(metric);
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setSelectedMetric(null);
	};

	return (
		<Box p={3}>
			<Typography variant="h4" gutterBottom>
				Dashboard ML Integration
			</Typography>
			
			{/* Seção OAuth */}
			<Box display="flex" flexWrap="wrap" gap={3} mb={4}>
				<Box flex="1" minWidth="300px">
					<OAuthLogin />
				</Box>
				<Box flex="1" minWidth="300px">
					<div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
						<h3 className="text-xl font-bold mb-2">🚀 Sistema OAuth2 Funcionando!</h3>
						<ul className="text-sm space-y-1">
							<li>✅ OAuth2 + PKCE implementado</li>
							<li>✅ Conectividade com Mercado Livre</li>
							<li>✅ APIs do ML integradas</li>
							<li>✅ Frontend ↔ Backend conectados</li>
						</ul>
					</div>
				</Box>
			</Box>

			{/* Métricas Dashboard */}
			<Typography variant="h5" gutterBottom>
				Métricas
			</Typography>
			<Box display="flex" flexWrap="wrap" gap={2}>
				{metrics.map((metric) => (
					<Box key={metric.id} flex="1" minWidth="300px">
						<div
							onClick={() => handleCardClick(metric)}
							style={{ cursor: "pointer" }}
						>
							<CardDashboard metric={metric} />
						</div>
					</Box>
				))}
			</Box>
			<Box mt={4}>
				<DashboardChart data={chartData} title="Vendas por mês" />
			</Box>
			<Box mt={4}>
				<DashboardTable 
					title="Performance dos Produtos"
					data={tableData} 
				/>
			</Box>
			{selectedMetric && (
				<DashboardModal
					open={modalOpen}
					metricLabel={selectedMetric.label}
					metricValue={selectedMetric.value}
					onClose={handleCloseModal}
				/>
			)}
		</Box>
	);
};

export default Dashboard;
