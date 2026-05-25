import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { isSuperAdminRole } from '@/domain/entities/role';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { APP_ROUTES } from '../../../routes/paths';
import { adminColors } from '../../../components/admin/adminTheme';

const IllustrationNewProduct = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="20" width="100" height="80" rx="10" fill={adminColors.surfaceAlt} />
    <rect x="25" y="35" width="70" height="10" rx="4" fill={adminColors.primarySoft} />
    <rect x="25" y="52" width="50" height="8" rx="4" fill="#EFC89A" />
    <rect x="25" y="67" width="35" height="8" rx="4" fill="#EFC89A" />
    <circle cx="88" cy="82" r="18" fill={adminColors.primary} />
    <rect x="80" y="81" width="16" height="2.5" rx="1.5" fill="white" />
    <rect x="88.75" y="73" width="2.5" height="16" rx="1.5" fill="white" />
  </svg>
);

const IllustrationListProduct = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="15" width="100" height="90" rx="10" fill={adminColors.successSoft} />
    <rect x="22" y="30" width="12" height="12" rx="3" fill={adminColors.success} />
    <rect x="40" y="32" width="55" height="8" rx="4" fill="#B9D4B4" />
    <rect x="22" y="52" width="12" height="12" rx="3" fill={adminColors.success} />
    <rect x="40" y="54" width="45" height="8" rx="4" fill="#B9D4B4" />
    <rect x="22" y="74" width="12" height="12" rx="3" fill={adminColors.success} />
    <rect x="40" y="76" width="60" height="8" rx="4" fill="#B9D4B4" />
  </svg>
);

const IllustrationOrders = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="18" width="90" height="84" rx="12" fill={adminColors.accentSoft} />
    <rect x="29" y="34" width="46" height="8" rx="4" fill={adminColors.accent} />
    <rect x="29" y="51" width="62" height="7" rx="3.5" fill="#EAAE9D" />
    <rect x="29" y="66" width="52" height="7" rx="3.5" fill="#EAAE9D" />
    <circle cx="87" cy="77" r="13" fill={adminColors.success} />
    <path d="M81 77.5L85 81.5L93 73.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const isRoot = location.pathname === APP_ROUTES.admin || location.pathname === `${APP_ROUTES.admin}/`;

  const cards = [
    {
      title: 'Cadastrar Produto',
      description: 'Adicione um novo produto ao catalogo',
      color: adminColors.primaryDark,
      hover: adminColors.primary,
      action: () => navigate(APP_ROUTES.adminNewProduct),
      illustration: <IllustrationNewProduct />,
    },
    {
      title: 'Listar Produtos',
      description: 'Veja e gerencie os produtos cadastrados',
      color: adminColors.success,
      hover: adminColors.success,
      action: () => navigate(APP_ROUTES.adminProducts),
      illustration: <IllustrationListProduct />,
    },
    {
      title: 'Gerir Pedidos',
      description: 'Atualize pagamento, separacao e envio',
      color: adminColors.accent,
      hover: adminColors.accent,
      action: () => navigate(APP_ROUTES.adminOrders),
      illustration: <IllustrationOrders />,
    },
    ...(isSuperAdminRole(currentUser?.role)
      ? [
          {
            title: 'Gerir Usuarios',
            description: 'Promova admins e revise acessos da operacao',
            color: adminColors.textPrimary,
            hover: adminColors.primaryDark,
            action: () => navigate(APP_ROUTES.adminUsers),
            illustration: <IllustrationListProduct />,
          },
        ]
      : []),
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: adminColors.background }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: adminColors.surface,
          color: adminColors.textPrimary,
          borderBottom: `1px solid ${adminColors.border}`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 800, letterSpacing: 1, cursor: 'pointer' }} onClick={() => navigate(APP_ROUTES.admin)}>
            Painel Admin
          </Typography>
        </Toolbar>
      </AppBar>

      {isRoot ? (
        <Box
          sx={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            px: 2,
          }}
        >
          <Typography variant="h4" fontWeight={800} color="text.primary" textAlign="center">
            O que deseja fazer?
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4} textAlign="center">
            Escolha uma das opcoes abaixo para continuar
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(220px, 1fr))', lg: 'repeat(3, minmax(220px, 1fr))' },
              gap: 4,
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              maxWidth: 760,
            }}
          >
            {cards.map((card) => (
              <Card
                key={card.title}
                elevation={0}
                sx={{
                  width: 220,
                  height: 280,
                  borderRadius: 4,
                  backgroundColor: adminColors.surface,
                  border: `1px solid ${adminColors.border}`,
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 18px 30px -20px ${card.hover}`,
                    borderColor: card.hover,
                  },
                }}
              >
                <CardActionArea
                  onClick={card.action}
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  {card.illustration}
                  <CardContent sx={{ textAlign: 'center', p: 0, pt: 1 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: card.color }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {card.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      )}
    </Box>
  );
};

export default AdminLayout;
