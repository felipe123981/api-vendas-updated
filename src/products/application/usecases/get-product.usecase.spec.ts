import "reflect-metadata";
import { ProductsRepository } from "@/products/domain/repositories/products.repository";
import { GetProductUseCase } from "./get-product.usecase";
import { ProductsInMemoryRepository } from "@/products/infrastructure/in-memory/repositories/products-in-memory.repository";
import { NotFoundError } from "@/common/domain/errors/NotFoundError";

describe("GetProductUseCase", () => {
  let sut: GetProductUseCase.UseCase;
  let repository: ProductsRepository;

  beforeEach(() => {
    repository = new ProductsInMemoryRepository();
    sut = new GetProductUseCase.UseCase(repository);
  });

  it("should be able to retrieve a product by ID", async () => {
    const spyFindById = jest.spyOn(repository, "findById");
    const props = {
      name: "Product 1",
      price: 100,
      quantity: 10,
    };
    const model = repository.create(props);
    await repository.insert(model);
    const result = await sut.execute({ id: model.id });

    expect(result).toMatchObject(model);
    expect(spyFindById).toHaveBeenCalledTimes(1);
  });

  it("throw an error if product does not exist", async () => {
    await expect(sut.execute({ id: "non-existing-id" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
