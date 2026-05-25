import React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useProduct } from '../../contexts/ProductContext';
import { useProductForm } from '../../hooks/useProductForm';
import { adminColors } from './adminTheme';
import { apiRequest, formatApiError } from '@/shared/api/httpClient';

type FormErrors = {
  name?: string;
  description?: string;
  sku?: string;
  price?: string;
  salePrice?: string;
  category?: string;
  stockQuantity?: string;
  weight?: string;
  height?: string;
  width?: string;
  length?: string;
  image?: string;
};

const CATEGORIES = [
  { value: 'cosmeticos', label: 'Cosmeticos' },
  { value: 'roupas', label: 'Roupas' },
] as const;

const DECIMAL_FIELDS = ['price', 'salePrice', 'weight', 'height', 'width', 'length'] as const;
const INTEGER_FIELDS = ['stockQuantity'] as const;

type SignedUpload = {
  provider: 's3' | 'local';
  method: 'PUT';
  uploadUrl: string;
  publicUrl: string;
  headers: Record<string, string>;
  expiresAt: string;
};

function normalizeNumericInput(raw: string, allowDecimals: boolean) {
  const cleaned = raw.replace(/[^\d.,]/g, '').replace(/,/g, '.');

  if (!allowDecimals) {
    return cleaned.replace(/\./g, '');
  }

  const parts = cleaned.split('.');
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join('')}`;
}

function toNumberOrNaN(value: string) {
  return value ? Number(value) : NaN;
}

export const ProductForm: React.FC = () => {
  const { form, handleChange, reset } = useProductForm();
  const { addProduct } = useProduct();
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [warningOpen, setWarningOpen] = React.useState(false);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);

  const validate = (): FormErrors => {
    const next: FormErrors = {};

    if (!String(form.name ?? '').trim()) next.name = 'Nome e obrigatorio.';
    if (!String(form.description ?? '').trim()) next.description = 'Descricao e obrigatoria.';
    if (!String(form.sku ?? '').trim()) next.sku = 'SKU e obrigatorio.';
    if (!String(form.category ?? '').trim()) next.category = 'Categoria e obrigatoria.';
    if (!form.image) next.image = 'Imagem JPEG e obrigatoria.';

    if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) next.price = 'Preco base deve ser maior que 0.';
    if (!Number.isFinite(Number(form.salePrice)) || Number(form.salePrice) <= 0) next.salePrice = 'Preco promocional deve ser maior que 0.';
    if (Number.isFinite(Number(form.price)) && Number.isFinite(Number(form.salePrice)) && Number(form.salePrice) > Number(form.price)) {
      next.salePrice = 'Preco promocional nao pode ser maior que o preco base.';
    }

    if (!Number.isInteger(Number(form.stockQuantity)) || Number(form.stockQuantity) < 0) next.stockQuantity = 'Estoque deve ser um inteiro maior ou igual a 0.';

    for (const field of ['weight', 'height', 'width', 'length'] as const) {
      const value = Number(form[field]);
      if (!Number.isFinite(value) || value <= 0) {
        next[field] = 'Campo obrigatorio com valor maior que 0.';
      }
    }

    return next;
  };

  const openWarning = () => setWarningOpen(true);

  const closeWarning = (_?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setWarningOpen(false);
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/jpeg') {
      setErrors((prev) => ({ ...prev, image: 'A imagem deve estar em formato JPEG (.jpg/.jpeg).' }));
      openWarning();
      event.target.value = '';
      return;
    }

    try {
      setIsUploadingImage(true);
      const signedUpload = await apiRequest<SignedUpload>('/uploads/sign', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      const uploadResponse = await fetch(signedUpload.uploadUrl, {
        method: signedUpload.method,
        headers: signedUpload.headers,
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Falha ao enviar imagem. Status ${uploadResponse.status}.`);
      }

      setPreviewUrl(URL.createObjectURL(file));
      handleChange('image', signedUpload.publicUrl);
      setErrors((prev) => ({ ...prev, image: undefined }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        image: formatApiError(error, 'Nao foi possivel enviar a imagem.'),
      }));
      openWarning();
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    handleChange('category', event.target.value);
    setErrors((prev) => ({ ...prev, category: undefined }));
  };

  const handleTextChange = (field: 'name' | 'description' | 'sku', value: string) => {
    handleChange(field, value);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleNumericChange = (
    field: typeof DECIMAL_FIELDS[number] | typeof INTEGER_FIELDS[number],
    rawValue: string,
  ) => {
    const allowDecimals = (DECIMAL_FIELDS as readonly string[]).includes(field);
    const normalized = normalizeNumericInput(rawValue, allowDecimals);
    handleChange(field as never, toNumberOrNaN(normalized) as never);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleNumericKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, allowDecimals: boolean) => {
    const allowed = allowDecimals
      ? ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', '.', ',']
      : ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

    if (allowed.includes(event.key) || event.ctrlKey || event.metaKey) return;

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      openWarning();
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      openWarning();
      return;
    }

    void addProduct({
      ...form,
      id: Date.now().toString(),
      variants: form.variants ?? [],
    });

    reset();
    setPreviewUrl(null);
    setErrors({});
  };

  const fieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: adminColors.surface,
    },
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 920, width: '100%', mx: 'auto', p: 2 }} noValidate>
      <Snackbar open={warningOpen} autoHideDuration={3000} onClose={closeWarning} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="warning" onClose={closeWarning} variant="filled" sx={{ width: '100%', backgroundColor: adminColors.accent, color: '#fff' }}>
          Preencha todos os campos obrigatorios do produto.
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, alignItems: 'start' }}>
        <TextField
          label="Nome"
          size="small"
          value={form.name}
          onChange={(event) => handleTextChange('name', event.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name}
          required
          fullWidth
          sx={fieldStyles}
        />

        <TextField
          label="SKU"
          size="small"
          value={form.sku}
          onChange={(event) => handleTextChange('sku', event.target.value.toUpperCase())}
          error={Boolean(errors.sku)}
          helperText={errors.sku}
          required
          fullWidth
          sx={fieldStyles}
        />

        <TextField
          label="Descricao"
          size="small"
          multiline
          minRows={3}
          value={form.description}
          onChange={(event) => handleTextChange('description', event.target.value)}
          error={Boolean(errors.description)}
          helperText={errors.description}
          required
          fullWidth
          sx={{ ...fieldStyles, gridColumn: '1 / -1' }}
        />

        <TextField
          label="Preco base"
          size="small"
          value={Number.isFinite(Number(form.price)) ? String(form.price) : ''}
          onChange={(event) => handleNumericChange('price', event.target.value)}
          onKeyDown={(event) => handleNumericKeyDown(event, true)}
          inputMode="decimal"
          error={Boolean(errors.price)}
          helperText={errors.price}
          required
          fullWidth
          sx={fieldStyles}
        />

        <TextField
          label="Preco promocional"
          size="small"
          value={Number.isFinite(Number(form.salePrice)) ? String(form.salePrice) : ''}
          onChange={(event) => handleNumericChange('salePrice', event.target.value)}
          onKeyDown={(event) => handleNumericKeyDown(event, true)}
          inputMode="decimal"
          error={Boolean(errors.salePrice)}
          helperText={errors.salePrice}
          required
          fullWidth
          sx={fieldStyles}
        />

        <FormControl size="small" fullWidth required error={Boolean(errors.category)}>
          <InputLabel id="category-label">Categoria</InputLabel>
          <Select labelId="category-label" label="Categoria" value={String(form.category ?? '')} onChange={handleCategoryChange} sx={{ backgroundColor: adminColors.surface }}>
            {CATEGORIES.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.category}</FormHelperText>
        </FormControl>

        <TextField
          label="Estoque"
          size="small"
          value={Number.isFinite(Number(form.stockQuantity)) ? String(form.stockQuantity) : ''}
          onChange={(event) => handleNumericChange('stockQuantity', event.target.value)}
          onKeyDown={(event) => handleNumericKeyDown(event, false)}
          inputMode="numeric"
          error={Boolean(errors.stockQuantity)}
          helperText={errors.stockQuantity}
          required
          fullWidth
          sx={fieldStyles}
        />

        <TextField
          label="Peso (kg)"
          size="small"
          value={Number.isFinite(Number(form.weight)) ? String(form.weight) : ''}
          onChange={(event) => handleNumericChange('weight', event.target.value)}
          onKeyDown={(event) => handleNumericKeyDown(event, true)}
          inputMode="decimal"
          error={Boolean(errors.weight)}
          helperText={errors.weight}
          required
          fullWidth
          sx={fieldStyles}
        />

        <TextField
          label="Altura (cm)"
          size="small"
          value={Number.isFinite(Number(form.height)) ? String(form.height) : ''}
          onChange={(event) => handleNumericChange('height', event.target.value)}
          onKeyDown={(event) => handleNumericKeyDown(event, true)}
          inputMode="decimal"
          error={Boolean(errors.height)}
          helperText={errors.height}
          required
          fullWidth
          sx={fieldStyles}
        />

        <TextField
          label="Largura (cm)"
          size="small"
          value={Number.isFinite(Number(form.width)) ? String(form.width) : ''}
          onChange={(event) => handleNumericChange('width', event.target.value)}
          onKeyDown={(event) => handleNumericKeyDown(event, true)}
          inputMode="decimal"
          error={Boolean(errors.width)}
          helperText={errors.width}
          required
          fullWidth
          sx={fieldStyles}
        />

        <TextField
          label="Comprimento (cm)"
          size="small"
          value={Number.isFinite(Number(form.length)) ? String(form.length) : ''}
          onChange={(event) => handleNumericChange('length', event.target.value)}
          onKeyDown={(event) => handleNumericKeyDown(event, true)}
          inputMode="decimal"
          error={Boolean(errors.length)}
          helperText={errors.length}
          required
          fullWidth
          sx={fieldStyles}
        />

        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ gridColumn: '1 / -1' }}>
          <Button
            variant="outlined"
            size="small"
            component="label"
            sx={{
              color: adminColors.primaryDark,
              borderColor: adminColors.border,
              '&:hover': {
                borderColor: adminColors.primary,
                backgroundColor: adminColors.primarySoft,
              },
            }}
          >
            {isUploadingImage ? 'Enviando...' : 'Upload JPEG'}
            <input hidden type="file" accept="image/jpeg,image/jpg" onChange={handleImageSelect} />
          </Button>

          {previewUrl ? (
            <Box component="img" src={previewUrl} alt="Pre-visualizacao" sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: adminColors.border }} />
          ) : (
            <Typography variant="caption" sx={{ color: adminColors.textSecondary }}>
              {isUploadingImage ? 'Processando imagem...' : 'Sem imagem'}
            </Typography>
          )}
        </Stack>

        <Box sx={{ gridColumn: '1 / -1' }}>
          {errors.image ? (
            <Typography variant="caption" sx={{ color: adminColors.danger }}>
              {errors.image}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            size="small"
            sx={{
              backgroundColor: adminColors.primary,
              '&:hover': {
                backgroundColor: adminColors.primaryDark,
              },
            }}
          >
            Adicionar
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
