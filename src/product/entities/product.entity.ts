import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductStatus } from '../product-status.enum';
import { User } from 'src/user/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import { Order } from 'src/order/entities/order.entity';

@Entity()
@ObjectType('Product')
export class Product {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  description: string;

  @Column()
  @Field()
  price: string;

  @Column()
  @Field()
  status: ProductStatus;

  @Column()
  @Field()
  createdAt: string;

  @ManyToOne(() => User, (user) => user.products)
  user: User;

  @ManyToOne(() => Order, (order) => order.products)
  @Field(() => Order)
  order: Order;

  @ManyToMany(() => Category, (category) => category.products)
  categories: Category[];

  @Column({ nullable: true })
  @Field({ nullable: true })
  imageUrl: string;
}
