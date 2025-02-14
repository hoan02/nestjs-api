import { Category } from 'src/schemas/category';

export class CategoryTableDto {
  data: Category[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;

  constructor(categories: Category[], page: number, limit: number, total: number) {
    this.data = categories;
    this.page = page;
    this.per_page = limit;
    this.total = total;
    this.total_pages = Math.ceil(total / limit);
  }
}
