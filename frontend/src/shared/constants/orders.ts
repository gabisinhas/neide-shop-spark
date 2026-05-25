import { OrderStatus } from '@/domain/entities/Order';

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_payment: 'Aguardando pagamento',
  paid: 'Pago',
  preparing: 'Em preparação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export const orderStatusTone: Record<OrderStatus, string> = {
  pending_payment: 'bg-secondary text-secondary-foreground',
  paid: 'bg-primary/15 text-primary',
  preparing: 'bg-accent/15 text-accent',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-destructive/15 text-destructive',
};
