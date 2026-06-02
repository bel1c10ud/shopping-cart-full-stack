import { Product, ProductsRepository } from './../types';

export const products = new Map<string, Product>();

class InMemoryProductsRepository implements ProductsRepository {
  store;

  constructor() {
    this.store = products;
  }

  async getAll() {
    return Array.from(this.store.entries()).map((entry) => entry[1]);
  }

  private generateUniqueId(): string {
    const id = crypto.randomUUID();

    return this.store.has(id) ? this.generateUniqueId() : id;
  }

  async insert(product: Omit<Product, 'productId'>) {
    const productObj = {
      productId: this.generateUniqueId(),
      ...product,
    };

    products.set(productObj.productId, productObj);

    return productObj;
  }

  async getById(productId: Product['productId']) {
    return this.store.get(productId);
  }

  async deleteById(productId: Product['productId']) {
    const product = this.store.get(productId);

    if (!product) return null;

    this.store.delete(productId);

    return product;
  }
}

export default InMemoryProductsRepository;
