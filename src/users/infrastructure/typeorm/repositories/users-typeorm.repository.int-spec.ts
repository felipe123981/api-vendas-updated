import { randomUUID } from 'node:crypto'
import { testDataSource } from '@/common/infrastructure/typeorm/testing/data-source'
import { UsersTypeormRepository } from './users-typeorm.repository'
import { User } from '../entities/users.entity'
import { NotFoundError } from '@/common/domain/errors/not-found-error'
import { UsersDataBuilder } from '../../testing/helpers/users-data-builder'
import { ConflictError } from '@/common/domain/errors/conflict-error'
import { UserModel } from '@/users/domain/models/user.model'

describe('UsersTypeormRepository integration tests', () => {
  let ormRepository: UsersTypeormRepository
  let typeormEntityManager: any

  beforeAll(async () => {
    await testDataSource.initialize()
    typeormEntityManager = testDataSource.createEntityManager()
  })

  afterAll(async () => {
    await testDataSource.destroy()
  })

  beforeEach(async () => {
    await testDataSource.manager.query('DELETE FROM users')
    ormRepository = new UsersTypeormRepository(
      typeormEntityManager.getRepository(User),
    )
  })

  describe('findById', () => {
    it('should generate an error when the user is not found', async () => {
      const id = randomUUID()
      await expect(ormRepository.findById(id)).rejects.toThrow(
        new NotFoundError(`User not found using ID ${id}`),
      )
    })

    it('should finds a user by id', async () => {
      const data = UsersDataBuilder({})
      const user = testDataSource.manager.create(User, data)
      await testDataSource.manager.save(user)

      const result = await ormRepository.findById(user.id)
      expect(result.id).toEqual(user.id)
      expect(result.name).toEqual(user.name)
      expect(result.email).toEqual(user.email)
    })
  })

  describe('create', () => {
    it('should create a new user object', () => {
      const data = UsersDataBuilder({})
      const result = ormRepository.create(data)
      expect(result.name).toEqual(data.name)
      expect(result.email).toEqual(data.email)
    })
  })

  describe('insert', () => {
    it('should insert a new user', async () => {
      const data = UsersDataBuilder({})
      const result = await ormRepository.insert(data)
      expect(result.name).toEqual(data.name)
      expect(result.email).toEqual(data.email)
    })
  })

  describe('update', () => {
    it('should generate an error when the user is not found', async () => {
      const data = UsersDataBuilder({})
      await expect(ormRepository.update(data)).rejects.toThrow(
        new NotFoundError(`User not found using ID ${data.id}`),
      )
    })

    it('should update a user', async () => {
      const data = UsersDataBuilder({})
      const user = testDataSource.manager.create(User, data)
      await testDataSource.manager.save(user)
      user.name = 'John Doe'

      const result = await ormRepository.update(user)
      expect(result.name).toEqual('John Doe')
    })
  })

  describe('delete', () => {
    it('should generate an error when the user is not found', async () => {
      const id = randomUUID()
      await expect(ormRepository.delete(id)).rejects.toThrow(
        new NotFoundError(`User not found using ID ${id}`),
      )
    })

    it('should delete a user', async () => {
      const data = UsersDataBuilder({})
      const user = testDataSource.manager.create(User, data)
      await testDataSource.manager.save(user)

      await ormRepository.delete(data.id)

      const result = await testDataSource.manager.findOneBy(User, {
        id: data.id,
      })
      expect(result).toBeNull()
    })
  })

  describe('findByName', () => {
    it('should generate an error when the user is not found', async () => {
      const name = 'John Doe'
      await expect(ormRepository.findByName(name)).rejects.toThrow(
        new NotFoundError(`User not found using name ${name}`),
      )
    })

    it('should finds a user by name', async () => {
      const data = UsersDataBuilder({ name: 'John Doe' })
      const user = testDataSource.manager.create(User, data)
      await testDataSource.manager.save(user)

      const result = await ormRepository.findByName(data.name)
      expect(result.name).toEqual('John Doe')
    })
  })

  describe('findByEmail', () => {
    it('should generate an error when the user is not found', async () => {
      const email = 'a@a.com'
      await expect(ormRepository.findByEmail(email)).rejects.toThrow(
        new NotFoundError(`User not found using email ${email}`),
      )
    })

    it('should finds a user by email', async () => {
      const data = UsersDataBuilder({ email: 'a@a.com' })
      const user = testDataSource.manager.create(User, data)
      await testDataSource.manager.save(user)

      const result = await ormRepository.findByEmail(data.email)
      expect(result.email).toEqual('a@a.com')
    })
  })

  describe('conflictingEmail', () => {
    it('should generate an error when the user found', async () => {
      const data = UsersDataBuilder({ email: 'a@a.com' })
      const user = testDataSource.manager.create(User, data)
      await testDataSource.manager.save(user)

      await expect(ormRepository.conflictingEmail('a@a.com')).rejects.toThrow(
        new ConflictError(`Email already used on another user`),
      )
    })
  })

  describe('search', () => {
    it('should apply only pagination when the other params are null', async () => {
      const arrange = Array(16).fill(UsersDataBuilder({}))
      arrange.map(element => delete element.id)
      const data = testDataSource.manager.create(User, arrange)
      await testDataSource.manager.save(data)

      const result = await ormRepository.search({
        page: 1,
        per_page: 15,
        sort: null,
        sort_dir: null,
        filter: null,
      })

      expect(result.total).toEqual(16)
      expect(result.items.length).toEqual(15)
    })

    it('should order by created_at DESC when search params are null', async () => {
      const created_at = new Date()
      const models: UserModel[] = []
      const arrange = Array(16).fill(UsersDataBuilder({}))
      arrange.forEach((element, index) => {
        delete element.id
        models.push({
          ...element,
          name: `User ${index}`,
          created_at: new Date(created_at.getTime() + index),
        })
      })
      const data = testDataSource.manager.create(User, models)
      await testDataSource.manager.save(data)

      const result = await ormRepository.search({
        page: 1,
        per_page: 15,
        sort: null,
        sort_dir: null,
        filter: null,
      })

      expect(result.items[0].name).toEqual('User 15')
      expect(result.items[14].name).toEqual('User 1')
    })

    it('should apply paginate and sort', async () => {
      const created_at = new Date()
      const models: UserModel[] = []
      'badec'.split('').forEach((element, index) => {
        models.push({
          ...UsersDataBuilder({}),
          name: element,
          created_at: new Date(created_at.getTime() + index),
        })
      })
      const data = testDataSource.manager.create(User, models)
      await testDataSource.manager.save(data)

      let result = await ormRepository.search({
        page: 1,
        per_page: 2,
        sort: 'name',
        sort_dir: 'ASC',
        filter: null,
      })

      expect(result.items[0].name).toEqual('a')
      expect(result.items[1].name).toEqual('b')
      expect(result.items.length).toEqual(2)

      result = await ormRepository.search({
        page: 1,
        per_page: 2,
        sort: 'name',
        sort_dir: 'DESC',
        filter: null,
      })

      expect(result.items[0].name).toEqual('e')
      expect(result.items[1].name).toEqual('d')
      expect(result.items.length).toEqual(2)
    })

    it('should search using filter, sort and paginate', async () => {
      const created_at = new Date()
      const models: UserModel[] = []
      const values = ['test', 'a', 'TEST', 'b', 'TeSt']
      values.forEach((element, index) => {
        models.push({
          ...UsersDataBuilder({}),
          name: element,
          created_at: new Date(created_at.getTime() + index),
        })
      })
      const data = testDataSource.manager.create(User, models)
      await testDataSource.manager.save(data)

      let result = await ormRepository.search({
        page: 1,
        per_page: 2,
        sort: 'name',
        sort_dir: 'ASC',
        filter: 'TEST',
      })

      expect(result.items[0].name).toEqual('test')
      expect(result.items[1].name).toEqual('TeSt')
      expect(result.items.length).toEqual(2)
      expect(result.total).toEqual(3)

      result = await ormRepository.search({
        page: 2,
        per_page: 2,
        sort: 'name',
        sort_dir: 'ASC',
        filter: 'TEST',
      })

      expect(result.items[0].name).toEqual('TEST')
      expect(result.items.length).toEqual(1)
      expect(result.total).toEqual(3)
    })
  })
})
