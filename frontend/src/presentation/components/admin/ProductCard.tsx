import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Product } from '../../../domain/entities/Product';
import { useProduct } from '../../contexts/ProductContext';
import { adminCategoryLabels, adminColors } from './adminTheme';
import { getEffectiveProductPrice } from '../../../shared/utils/productPricing';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { removeProduct } = useProduct();
  const effectivePrice = getEffectiveProductPrice(product);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: adminColors.surface,
        border: `1px solid ${adminColors.border}`,
      }}
    >
      <CardMedia
        component="img"
        image={product.image}
        alt={product.name}
        sx={{
          height: 220,
          objectFit: 'cover',
          backgroundColor: adminColors.surfaceAlt,
        }}
      />

      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: adminColors.textPrimary }}>
              {product.name}
            </Typography>
            <Chip
              label={adminCategoryLabels[product.category] ?? product.category}
              size="small"
              sx={{
                backgroundColor: adminColors.primarySoft,
                color: adminColors.primaryDark,
                fontWeight: 600,
              }}
            />
          </Stack>

          <Typography variant="body1" sx={{ fontWeight: 700, color: adminColors.success }}>
            {formatCurrency(effectivePrice)}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {product.sku ? (
              <Chip
                label={`SKU: ${product.sku}`}
                size="small"
                sx={{
                  backgroundColor: adminColors.surfaceAlt,
                  color: adminColors.textPrimary,
                }}
              />
            ) : null}
            {typeof product.stockQuantity === 'number' ? (
              <Chip
                label={`Estoque: ${product.stockQuantity}`}
                size="small"
                sx={{
                  backgroundColor: adminColors.primarySoft,
                  color: adminColors.primaryDark,
                }}
              />
            ) : null}
          </Stack>

          {product.description ? (
            <Typography variant="body2" sx={{ color: adminColors.textSecondary }}>
              {product.description}
            </Typography>
          ) : null}

          <Button
            variant="outlined"
            color="error"
            onClick={() => void removeProduct(product.id)}
            sx={{
              alignSelf: 'flex-end',
              borderColor: adminColors.dangerSoft,
              color: adminColors.danger,
              '&:hover': {
                borderColor: adminColors.danger,
                backgroundColor: adminColors.dangerSoft,
              },
            }}
          >
            Remover
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
