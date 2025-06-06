import { ProductsRepository } from "@/products/domain/repositories/products.repository";
import { inject, injectable } from "tsyringe";

export namespace GetProductUseCase {
  export type Input = {
    id: string;
  };

  export type Output = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    created_at: Date;
    updated_at: Date;
  };

  @injectable()
  export class UseCase {
    constructor(
      @inject("ProductsRepository")
      private productsRepository: ProductsRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
      const product = await this.productsRepository.findById(input.id);

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        created_at: product.created_at,
        updated_at: product.updated_at,
      };
    }
  }
}
