import { User } from 'src/schemas/user';

export class UserTableDto {
  data: User[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;

  constructor(users: User[], page: number, limit: number, total: number) {
    this.data = users;
    this.page = page;
    this.per_page = limit;
    this.total = total;
    this.total_pages = Math.ceil(total / limit);
  }
}
