import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductForm } from '../../../../presentation/components/admin/ProductForm';
import { APP_ROUTES } from '../../../routes/paths';

import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { adminColors } from '../../../components/admin/adminTheme';

export const AdminProductCreatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 3,
          backgroundColor: adminColors.surface,
          border: `1px solid ${adminColors.border}`,
        }}
        elevation={0}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: adminColors.textPrimary }}>
            Novo produto
          </Typography>

          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(APP_ROUTES.adminProducts)}
            sx={{
              color: adminColors.primaryDark,
              borderColor: adminColors.border,
              '&:hover': {
                borderColor: adminColors.primary,
                backgroundColor: adminColors.primarySoft,
              },
            }}
          >
            Voltar
          </Button>
        </Stack>

        <ProductForm />
      </Paper>
    </Container>
  );
};

export default AdminProductCreatePage;
