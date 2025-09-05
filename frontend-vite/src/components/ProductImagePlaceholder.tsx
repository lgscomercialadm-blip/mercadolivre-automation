import React from 'react';
import { Box, Typography } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';

interface ProductImagePlaceholderProps {
  width?: number | string;
  height?: number | string;
  productName?: string;
}

const ProductImagePlaceholder: React.FC<ProductImagePlaceholderProps> = ({
  width = 200,
  height = 200,
  productName = 'Produto'
}) => {
  return (
    <Box
      sx={{
        width,
        height,
        backgroundColor: 'grey.100',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid',
        borderColor: 'grey.300',
        borderRadius: 1,
        color: 'grey.500'
      }}
    >
      <ImageIcon sx={{ fontSize: '3rem', mb: 1 }} />
      <Typography variant="caption" textAlign="center">
        Imagem do {productName}
      </Typography>
    </Box>
  );
};

export default ProductImagePlaceholder;
