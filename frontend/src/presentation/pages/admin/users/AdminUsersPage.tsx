import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { User, UserRole } from '@/domain/entities/User';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { adminColors } from '@/presentation/components/admin/adminTheme';
import { apiRequest, formatApiError } from '@/shared/api/httpClient';

type AuditLog = {
  id: string;
  actorUserEmail: string;
  targetEntity: string;
  targetEntityId: string;
  action: string;
  metadata?: Record<string, unknown>;
  traceId: string;
  createdAt: string;
};

const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Cliente',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

export default function AdminUsersPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsersAndAudit = async () => {
      try {
        const [usersResponse, auditResponse] = await Promise.all([
          apiRequest<User[]>('/users'),
          apiRequest<AuditLog[]>('/audit-logs?limit=12'),
        ]);
        setUsers(usersResponse);
        setAuditLogs(auditResponse);
      } catch (err) {
        setError(formatApiError(err, 'Nao foi possivel carregar os usuarios.'));
      }
    };

    void fetchUsersAndAudit();
  }, []);

  const handleRoleChange = async (userId: string, event: SelectChangeEvent<UserRole>) => {
    const role = event.target.value as UserRole;

    try {
      const updated = await apiRequest<User>(`/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      const auditResponse = await apiRequest<AuditLog[]>('/audit-logs?limit=12');

      setUsers((current) => current.map((user) => (user.id === userId ? updated : user)));
      setAuditLogs(auditResponse);
      setError(null);
    } catch (err) {
      setError(formatApiError(err, 'Nao foi possivel atualizar a role.'));
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: adminColors.textPrimary }}>
          Gestao de usuarios
        </Typography>
        <Typography variant="body1" sx={{ color: adminColors.textSecondary }}>
          Apenas super admins podem promover admins e controlar acessos administrativos.
        </Typography>
      </Stack>

      {error ? (
        <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: `1px solid ${adminColors.dangerSoft}`, backgroundColor: '#fff7f5' }}>
          <Typography sx={{ color: adminColors.danger }}>{error}</Typography>
        </Paper>
      ) : null}

      <Stack spacing={2}>
        {users.map((user) => {
          const isSelf = user.id === currentUser?.id;

          return (
            <Paper
              key={user.id}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${adminColors.border}`,
                backgroundColor: adminColors.surface,
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: adminColors.textPrimary }}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: adminColors.textSecondary }}>
                    {user.email}
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  {isSelf ? (
                    <Chip label="Sua conta" sx={{ backgroundColor: adminColors.primarySoft, color: adminColors.primaryDark, fontWeight: 700 }} />
                  ) : null}

                  <FormControl size="small" sx={{ minWidth: 220 }}>
                    <Select
                      value={user.role}
                      onChange={(event) => void handleRoleChange(user.id, event)}
                      disabled={isSelf && user.role === 'super_admin'}
                      sx={{ backgroundColor: adminColors.surfaceAlt }}
                    >
                      {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                        <MenuItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 800, color: adminColors.textPrimary }}>
          Auditoria recente
        </Typography>

        <Stack spacing={2}>
          {auditLogs.map((log) => {
            const previousRole = typeof log.metadata?.previousRole === 'string' ? log.metadata.previousRole : '-';
            const nextRole = typeof log.metadata?.nextRole === 'string' ? log.metadata.nextRole : '-';
            const targetUserEmail = typeof log.metadata?.targetUserEmail === 'string' ? log.metadata.targetUserEmail : log.targetEntityId;

            return (
              <Paper
                key={log.id}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `1px solid ${adminColors.border}`,
                  backgroundColor: adminColors.surface,
                }}
              >
                <Stack spacing={0.75}>
                  <Typography sx={{ fontWeight: 700, color: adminColors.textPrimary }}>
                    {log.actorUserEmail} alterou {targetUserEmail}
                  </Typography>
                  <Typography variant="body2" sx={{ color: adminColors.textSecondary }}>
                    {previousRole} {'->'} {nextRole}
                  </Typography>
                  <Typography variant="caption" sx={{ color: adminColors.textSecondary }}>
                    {new Date(log.createdAt).toLocaleString('pt-BR')} | trace {log.traceId}
                  </Typography>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}
