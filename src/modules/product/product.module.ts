import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, productSchema } from 'src/schemas/product';
import { Category, categorySchema } from 'src/schemas/category';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: productSchema },
      { name: Category.name, schema: categorySchema }
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
