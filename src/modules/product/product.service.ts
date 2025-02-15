import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from 'src/schemas/product';
import { CreateProductDto, UpdateProductDto } from './_dto/product.dto';
import { ProductTableDto } from './_dto/product-table.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async findAll(page: number, limit: number): Promise<ProductTableDto> {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find()
        .populate('category')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments().exec(),
    ]);

    return new ProductTableDto(products, page, limit, total);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id)
      .populate({
        path: 'category',
        select: '_id name description',
        model: 'Category'
      });
    console.log('Product with populated category:', product);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .populate('category');
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // await new Promise<void>((resolve) => setTimeout(resolve, 3000));
    return product;
  }

  async delete(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
