import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { useOrders } from '@/presentation/contexts/OrderContext';
import { orderStatusLabels } from '@/shared/constants/orders';
import { OrderStatus } from '@/domain/entities/Order';
import { adminColors } from '@/presentation/components/admin/adminTheme';
import { getEffectiveProductPrice } from '@/shared/utils/productPricing';

const statuses: OrderStatus[] = ['pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useOrders();

  const handleStatusChange = async (orderId: string, event: SelectChangeEvent<OrderStatus>) => {
    await updateOrderStatus(orderId, event.target.value as OrderStatus);
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: adminColors.textPrimary }}>
          Pedidos vendidos
        </Typography>
        <Typography variant="body1" sx={{ color: adminColors.textSecondary }}>
          Atualize andamento, pagamento e envio dos pedidos da loja.
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {orders.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: `1px solid ${adminColors.border}` }}>
            <Typography sx={{ color: adminColors.textSecondary }}>Nenhum pedido registrado ainda.</Typography>
          </Paper>
        ) : (
          orders.map((order) => (
            <Paper
              key={order.id}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${adminColors.border}`,
                backgroundColor: adminColors.surface,
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="overline" sx={{ color: adminColors.textSecondary }}>
                    {order.id}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: adminColors.textPrimary }}>
                    {order.userName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: adminColors.textSecondary }}>
                    {order.userEmail}
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <Chip
                    label={`${order.items.length} item(ns)`}
                    sx={{ backgroundColor: adminColors.primarySoft, color: adminColors.primaryDark, fontWeight: 700 }}
                  />
                  <Select
                    size="small"
                    value={order.status}
                    onChange={(event) => handleStatusChange(order.id, event)}
                    sx={{ minWidth: 220, backgroundColor: adminColors.surfaceAlt }}
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {orderStatusLabels[status]}
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2, borderColor: adminColors.border }} />

              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: adminColors.textPrimary }}>
                    Itens do pedido
                  </Typography>
                  <Stack spacing={1}>
                    {order.items.map(({ product, quantity }) => (
                      <Box key={product.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: adminColors.textSecondary }}>
                          {product.name} x {quantity}
                        </Typography>
                        <Typography variant="body2" sx={{ color: adminColors.textPrimary, fontWeight: 700 }}>
                          R$ {(getEffectiveProductPrice(product) * quantity).toFixed(2).replace('.', ',')}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Box sx={{ minWidth: 260 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: adminColors.textPrimary }}>
                    Entrega e pagamento
                  </Typography>
                  <Typography variant="body2" sx={{ color: adminColors.textSecondary }}>
                    {order.address.street}, {order.address.number} - {order.address.district}
                  </Typography>
                  <Typography variant="body2" sx={{ color: adminColors.textSecondary, mb: 1 }}>
                    {order.address.city}/{order.address.state} - {order.address.zipCode}
                  </Typography>
                  <Typography variant="body2" sx={{ color: adminColors.textSecondary }}>
                    {order.paymentMethod === 'pix' ? 'PIX' : order.paymentMethod === 'credit_card' ? 'Cartão' : 'Boleto'}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, color: adminColors.success, fontWeight: 800 }}>
                    R$ {order.total.toFixed(2).replace('.', ',')}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))
        )}
      </Stack>
    </Box>
  );
}
