import { CreateProductUseCase } from "@/products/application/usecases/create-product.usecase";
import { ProductsTypeormRepository } from "@/products/infrastructure/typeorm/repositories/products-typeorm.repository";
import { container } from "tsyringe";

container.registerSingleton("ProductsRepository", ProductsTypeormRepository);
container.registerSingleton(
  "CreateProductUseCase",
  CreateProductUseCase.UseCase,
);
