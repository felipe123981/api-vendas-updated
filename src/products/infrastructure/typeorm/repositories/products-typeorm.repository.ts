import {
  SearchInput,
  SearchOutput,
} from '@/common/domain/repositories/repository.interface'
import { ProductModel } from '@/products/domain/model/products.model'
import {
  CreateProductProps,
  ProductId,
  ProductsRepository,
} from '@/products/domain/repositories/products.repository'
import { ILike, In, Repository } from 'typeorm'
import { Product } from '../entities/products.entity'
import { NotFoundError } from '@/common/domain/errors/not-found-error'
import { ConflictError } from '@/common/domain/errors/conflict-error'
import { inject, injectable } from 'tsyringe'

@injectable()
export class ProductsTypeormRepository implements ProductsRepository {
  sortableFields: string[] = ['name', 'created_at']

  constructor(
    @inject('ProductsDefaultTypeormRepository')
    private productsRepository: Repository<Product>,
  ) {}

  async findByName(name: string): Promise<ProductModel> {
    const product = await this.productsRepository.findOneBy({ name })
    if (!product) {
      throw new NotFoundError(`Product not found using name ${name}`)
    }
    return product
  }

  async findAllByIds(productIds: ProductId[]): Promise<ProductModel[]> {
    const ids = productIds.map(productId => productId.id)

    const productsFound = await this.productsRepository.find({
      where: { id: In(ids) },
    })

    return productsFound
  }

  async conflictingName(name: string): Promise<void> {
    const product = await this.productsRepository.findOneBy({ name })
    if (product) {
      throw new ConflictError(`Name already used by another product`)
    }
  }

  create(props: CreateProductProps): ProductModel {
    return this.productsRepository.create(props)
  }

  async insert(model: ProductModel): Promise<ProductModel> {
    return this.productsRepository.save(model)
  }

  async findById(id: string): Promise<ProductModel> {
    return this._get(id)
  }

  async update(model: ProductModel): Promise<ProductModel> {
    await this._get(model.id)
    await this.productsRepository.update({ id: model.id }, model)
    return model
  }

  async delete(id: string): Promise<void> {
    await this._get(id)
    await this.productsRepository.delete({ id })
  }

  async search(props: SearchInput): Promise<SearchOutput<ProductModel>> {
    const validSort = this.sortableFields.includes(props.sort) || false
    const dirOps = ['asc', 'desc']
    const validSortDir =
      (props.sort_dir && dirOps.includes(props.sort_dir.toLowerCase())) || false
    const orderByField = validSort ? props.sort : 'created_at'
    const orderByDir = validSortDir ? props.sort_dir : 'desc'

    const [products, total] = await this.productsRepository.findAndCount({
      ...(props.filter && { where: { name: ILike(`%${props.filter}%`) } }),
      order: { [orderByField]: orderByDir },
      skip: (props.page - 1) * props.per_page,
      take: props.per_page,
    })

    return {
      items: products,
      per_page: props.per_page,
      total,
      current_page: props.page,
      sort: orderByField,
      sort_dir: orderByDir,
      filter: props.filter,
    }
  }

  protected async _get(id: string): Promise<ProductModel> {
    const product = await this.productsRepository.findOneBy({ id })
    if (!product) {
      throw new NotFoundError(`Product not found using ID ${id}`)
    }
    return product
  }
}
