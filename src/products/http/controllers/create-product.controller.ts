import { AppError } from "@/common/domain/errors/AppError";
import { CreateProductUseCase } from "@/products/application/usecases/create-product.usecase";
import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { z } from "zod";

export async function createProductController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const createProductBodySchema = z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
  });

  const validatedData = createProductBodySchema.safeParse(request.body);

  if (!validatedData.success) {
    const errorMessage = validatedData.error.errors
      .map((err) => `${err.path.join(".")} -> ${err.message}`)
      .join("; ");

    console.error("Dados inválidos:", errorMessage);

    // Lança o erro e repassa para o middleware
    const error = new AppError(errorMessage);
    return next(error);
  }

  try {
    const { name, price, quantity } = validatedData.data;

    const createProductUseCase: CreateProductUseCase.UseCase =
      container.resolve("CreateProductUseCase");

    const product = await createProductUseCase.execute({
      name,
      price,
      quantity,
    });

    return response.status(201).json(product);
  } catch (error) {
    // Repassa qualquer erro para o middleware global
    next(error);
  }
}
