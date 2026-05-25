import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../../../contexts/ProductContext';
import { ProductCard } from '../../../components/admin/ProductCard';
import { APP_ROUTES } from '../../../routes/paths';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { adminColors } from '../../../components/admin/adminTheme';

type CategoryFilter = 'all' | 'cosmeticos' | 'roupas';

export const AdminProductListPage: React.FC = () => {
  const { products } = useProduct();
  const navigate = useNavigate();

  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<CategoryFilter>('all');

  const handleLogout = () => {
    navigate(APP_ROUTES.home);
  };

  const filteredProducts = React.useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((p) => {
      const name = String(p.name ?? '').toLowerCase();
      const cat = String(p.category ?? '').toLowerCase();

      const matchQuery = !q || name.includes(q);
      const matchCategory = category === 'all' || cat === category;

      return matchQuery && matchCategory;
    });
  }, [products, query, category]);

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setCategory(e.target.value as CategoryFilter);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 3,
          backgroundColor: adminColors.surface,
          border: `1px solid ${adminColors.border}`,
        }}
        elevation={0}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Typography variant="h6" sx={{ fontWeight: 800, color: adminColors.textPrimary }}>
              Produtos cadastrados
            </Typography>
            <Typography variant="body2" sx={{ color: adminColors.textSecondary }}>
              {products.length} {products.length === 1 ? 'produto' : 'produtos'}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              size="small"
              onClick={handleLogout}
              sx={{
                color: adminColors.textPrimary,
                borderColor: adminColors.border,
                '&:hover': {
                  borderColor: adminColors.accent,
                  backgroundColor: adminColors.accentSoft,
                },
              }}
            >
              Sair
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate(APP_ROUTES.adminNewProduct)}
              sx={{
                backgroundColor: adminColors.primary,
                '&:hover': {
                  backgroundColor: adminColors.primaryDark,
                },
              }}
            >
              Novo produto
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2, borderColor: adminColors.border }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' },
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <TextField
            label="Buscar por nome"
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: adminColors.surface,
              },
            }}
          />

          <FormControl size="small" fullWidth>
            <InputLabel id="filter-category-label">Categoria</InputLabel>
            <Select
              labelId="filter-category-label"
              label="Categoria"
              value={category}
              onChange={handleCategoryChange}
              sx={{ backgroundColor: adminColors.surface }}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="cosmeticos">Cosméticos</MenuItem>
              <MenuItem value="roupas">Roupas</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Divider sx={{ my: 3, borderColor: adminColors.border }} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Box>

      {filteredProducts.length === 0 ? (
        <Typography variant="body2" sx={{ mt: 2, color: adminColors.textSecondary }}>
          Nenhum produto encontrado.
        </Typography>
      ) : null}
    </Container>
  );
};

export default AdminProductListPage;
