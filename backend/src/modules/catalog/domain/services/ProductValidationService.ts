import { DomainError } from '../../../../shared/domain/DomainError';
import { Product } from '../entities/Product';

export class ProductValidationService {
  static validateForCreation(product: Product) {
    this.assertBasicFields(product);
  }

  static validateForUpdate(product: Partial<Product>) {
    if (product.price != null && !Number.isFinite(Number(product.price))) {
      throw new DomainError('Preco do produto invalido.');
    }

    if (product.price != null && Number(product.price) <= 0) {
      throw new DomainError('Preco do produto invalido.');
    }

    if (product.salePrice != null && (!Number.isFinite(Number(product.salePrice)) || Number(product.salePrice) <= 0)) {
      throw new DomainError('Preco promocional invalido.');
    }

    if (product.salePrice != null && product.price != null && Number(product.salePrice) > Number(product.price)) {
      throw new DomainError('Preco promocional nao pode ser maior que o preco base.');
    }

    if (product.originalPrice != null && !Number.isFinite(Number(product.originalPrice))) {
      throw new DomainError('Preco original invalido.');
    }

    if (product.stockQuantity != null) {
      this.assertPositiveNumber(product.stockQuantity, 'Estoque invalido.');
    }

    if (product.weight != null) {
      this.assertPositiveNumber(product.weight, 'Peso invalido.');
    }

    if (product.height != null) {
      this.assertPositiveNumber(product.height, 'Altura invalida.');
    }

    if (product.width != null) {
      this.assertPositiveNumber(product.width, 'Largura invalida.');
    }

    if (product.length != null) {
      this.assertPositiveNumber(product.length, 'Comprimento invalido.');
    }

    if (product.installments) {
      this.assertInstallments(product.installments.count, product.installments.value);
    }
  }

  private static assertBasicFields(product: Product) {
    if (
      !product.name?.trim() ||
      !product.description?.trim() ||
      !product.image?.trim() ||
      !product.category?.trim() ||
      !product.sku?.trim()
    ) {
      throw new DomainError('Dados do produto invalidos.');
    }

    if (!Number.isFinite(Number(product.price)) || Number(product.price) <= 0) {
      throw new DomainError('Preco do produto invalido.');
    }

    if (product.salePrice != null && (!Number.isFinite(Number(product.salePrice)) || Number(product.salePrice) <= 0)) {
      throw new DomainError('Preco promocional invalido.');
    }

    if (product.salePrice != null && Number(product.salePrice) > Number(product.price)) {
      throw new DomainError('Preco promocional nao pode ser maior que o preco base.');
    }

    if (product.originalPrice != null && !Number.isFinite(Number(product.originalPrice))) {
      throw new DomainError('Preco original invalido.');
    }

    this.assertPositiveNumber(product.stockQuantity, 'Estoque invalido.');
    this.assertPositiveNumber(product.weight, 'Peso invalido.');
    this.assertPositiveNumber(product.height, 'Altura invalida.');
    this.assertPositiveNumber(product.width, 'Largura invalida.');
    this.assertPositiveNumber(product.length, 'Comprimento invalido.');

    if (product.installments) {
      this.assertInstallments(product.installments.count, product.installments.value);
    }
  }

  private static assertPositiveNumber(value: number | undefined, message: string) {
    if (!Number.isFinite(Number(value)) || Number(value) < 0) {
      throw new DomainError(message);
    }
  }

  private static assertInstallments(count: number, value: number) {
    if (!Number.isInteger(count) || count <= 0 || !Number.isFinite(Number(value)) || Number(value) <= 0) {
      throw new DomainError('Parcelamento invalido.');
    }
  }
}
