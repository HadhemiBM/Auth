import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository, Between, Like } from 'typeorm';

import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { CategoryService } from 'src/category/category.service';
import { ProductStatus } from './product-status.enum';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private userService: UserService,
    private categoryService: CategoryService,
  ) {}

  /////////////////////////createProduct/////////////////////////

  // async create(
  //   createProductInput: CreateProductInput,
  //   user: User,
  // ): Promise<Product> {
  //   const newProduct = this.productRepository.create(createProductInput);
  //   newProduct.user = user; // Assigning the user who created the product

  //   return this.productRepository.save(newProduct); // Save the product to the database
  // }
  async create(
    createProductInput: CreateProductInput,
    user: User,
  ): Promise<Product> {
    try {
      // Find the category by its ID
      const category = await this.categoryService.getCategoryById(
        createProductInput.categoryId,
      );
      if (!category) {
        throw new Error(
          `Category with ID ${createProductInput.categoryId} does not exist.`,
        );
      }

      const newProduct = this.productRepository.create(createProductInput);
      newProduct.user = user;
      newProduct.category = category; // Assign the category to the product

      // Save the product, ensuring the category relationship is persisted
      const savedProduct = await this.productRepository.save(newProduct);

      return savedProduct;
    } catch (error) {
      console.error('Error during product creation:', error);
      throw new InternalServerErrorException(
        'An error occurred while creating the product.',
      );
    }
  }

  ///////////////////////////getAllProducts/////////////////////////
  async getAllProducts(
    userId?: string,
    categoryId?: string,
    title?: string,
    price?: string,
  ): Promise<Product[]> {
    const query: any = {};

    if (userId) {
      query.user = { id: userId };
    }
    if (categoryId) {
      query.category = { id: categoryId };
    }
    if (title) {
      query.title = title;
    }
    if (price) {
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice)) {
        throw new Error('Price must be a valid number');
      }

      const lowerBound = Math.floor(numericPrice);
      const upperBound = Math.ceil(numericPrice + 1) - 0.01;

      if (numericPrice % 1 === 0) {
        query.price = Between(lowerBound, upperBound);
      } else {
        query.price = Like(`${numericPrice}%`);
      }
    }
    try {
      const products = await this.productRepository.find({
        where: query,
        relations: ['user', 'category'],
      });

      if (products.length === 0) {
        throw new NotFoundException('No products found');
      }

      return products;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching products');
    }
  }

  ///////////////////////////deleteProduct/////////////////////////

  async deleteProduct(id: string, user: User): Promise<Product> {
    const productFound: Product = await this.getProductUserById(id, user);
    const removedProductId = productFound.id;
    const result: Product = await this.productRepository.remove(productFound);

    if (!result) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    result.id = removedProductId;
    return result;
  }
  ///////////////////////////getProductById/////////////////////////

  async getProductUserById(id: string, user: User): Promise<Product> {
    const productFound = await this.productRepository.findOne({
      where: { id, user },
      relations: ['user', 'category'],
    });

    if (!productFound) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return productFound;
  }

  ///////////////////////////UpdateProduct/////////////////////////
  async updateProductt(product: Product): Promise<Product> {
    return this.productRepository.save(product); // Update the product in the database
  }
  async updateProduct(
    updateProductInput: UpdateProductInput,
    user: User,
  ): Promise<Product> {
    const product = await this.getProductUserById(updateProductInput.id, user);
    const { title, description, status, price, imageUrl } = updateProductInput;
    if (title) {
      product.title = title;
    }
    if (description) {
      product.description = description;
    }
    if (price) {
      product.price = price;
    }
    if (status) {
      product.status = status;
    }

    if (imageUrl) {
      product.imageUrl = imageUrl;
    }
    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async likeProduct(id: string, user: User): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['likedBy'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const hasLiked = product.likedBy.some((u) => u.id === user.id);
    if (hasLiked) {
      throw new Error('You have already liked this product');
    }

    product.likedBy.push(user); // Add user to likedBy
    product.nbrLike += 1; // Increment like count

    await this.productRepository.save(product);

    return product;
  }

  async dislikeProduct(id: string, user: User): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['likedBy'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const userIndex = product.likedBy.findIndex((u) => u.id === user.id);
    if (userIndex === -1) {
      throw new Error('You have not liked this product yet');
    }

    product.likedBy.splice(userIndex, 1); // Remove user from likedBy
    product.nbrLike -= 1; // Decrement like count

    await this.productRepository.save(product);

    return product;
  }
}
