import { Product } from 'src/schemas/product';

export class ProductTableDto {
  data: Product[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;

  constructor(products: Product[], page: number, limit: number, total: number) {
    this.data = products;
    this.page = page;
    this.per_page = limit;
    this.total = total;
    this.total_pages = Math.ceil(total / limit);
  }
}
