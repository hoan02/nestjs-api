import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Category } from '../../../schemas/category';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsOptional()
  @Type(() => Category)
  category?: Category;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  image?: number;

  @IsOptional()
  @Type(() => Category)
  category?: Category;
}
