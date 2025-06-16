import { NotFoundError } from '@/common/domain/errors/NotFoundError'
import { UsersInMemoryRepository } from './users-in-memory.repository'
import { UsersDataBuilder } from '../../testing/helpers/users-data-builder'
import { ConflictError } from '@/common/domain/errors/ConflictError'
describe('UsersInMemoryRepository Unit Tests', () => {
  let sut: UsersInMemoryRepository

  beforeEach(() => {
    sut = new UsersInMemoryRepository()
    sut.items = []
  })

  describe('findByEmail', () => {
    it('should throw error when user not found', async () => {
      await expect(() => sut.findByEmail('a@a.com')).rejects.toBeInstanceOf(
        NotFoundError,
      )
      await expect(sut.findByEmail('a@a.com')).rejects.toThrow(
        new NotFoundError('User not found using email a@a.com'),
      )
    })

    it('should find a user by email', async () => {
      const user = UsersDataBuilder({ email: 'a@a.com' })
      await sut.insert(user)
      const result = await sut.findByEmail(user.email)
      expect(result).toStrictEqual(user)
    })
  })

  describe('findByName', () => {
    it('should throw error when user not found', async () => {
      await expect(() => sut.findByName('John Doe')).rejects.toBeInstanceOf(
        NotFoundError,
      )
      await expect(sut.findByName('John Doe')).rejects.toThrow(
        new NotFoundError('User not found using name John Doe'),
      )
    })

    it('should find a user by name', async () => {
      const user = UsersDataBuilder({ name: 'John Doe' })
      await sut.insert(user)
      const result = await sut.findByName(user.name)
      expect(result).toStrictEqual(user)
    })
  })

  describe('conflictingEmail', () => {
    it('should throw error when user found', async () => {
      const user = UsersDataBuilder({ email: 'a@a.com' })
      await sut.insert(user)
      await expect(sut.conflictingEmail('a@a.com')).rejects.toThrow(
        ConflictError,
      )
      await expect(sut.conflictingEmail('a@a.com')).rejects.toThrow(
        new ConflictError('Email already used on another user'),
      )
    })

    it('should not find a user by email', async () => {
      expect.assertions(0)
      await sut.conflictingEmail('a@a.com')
    })
  })

  describe('applyFilter', () => {
    it('should no filter items when filter object is null', async () => {
      const user = UsersDataBuilder({})
      sut.insert(user)
      const spyFilter = jest.spyOn(sut.items, 'filter' as any)

      const filteredItems = await sut['applyFilter'](sut.items, null as any)
      expect(spyFilter).not.toHaveBeenCalled()
      expect(filteredItems).toStrictEqual(sut.items)
    })

    it('should filter name field using filter parameter', async () => {
      const items = [
        UsersDataBuilder({ name: 'Test' }),
        UsersDataBuilder({ name: 'TEST' }),
        UsersDataBuilder({ name: 'fake' }),
      ]
      sut.items = items
      const spyFilter = jest.spyOn(sut.items, 'filter' as any)

      const filteredItems = await sut['applyFilter'](sut.items, 'TEST')
      expect(spyFilter).toHaveBeenCalledTimes(1)
      expect(filteredItems).toStrictEqual([sut.items[0], sut.items[1]])
    })
  })

  describe('applySort', () => {
    it('should sort by created_at when sort param is null', async () => {
      const created_at = new Date()
      const items = [
        UsersDataBuilder({
          name: 'c',
          created_at: created_at,
        }),
        UsersDataBuilder({
          name: 'a',
          created_at: new Date(created_at.getTime() + 100),
        }),
        UsersDataBuilder({
          name: 'b',
          created_at: new Date(created_at.getTime() + 200),
        }),
      ]
      sut.items = items
      const sortedItems = await sut['applySort'](sut.items, null, null)
      expect(sortedItems).toStrictEqual([
        sut.items[2],
        sut.items[1],
        sut.items[0],
      ])
    })

    it('should sort by name field', async () => {
      const items = [
        UsersDataBuilder({ name: 'c' }),
        UsersDataBuilder({ name: 'b' }),
        UsersDataBuilder({ name: 'a' }),
      ]
      sut.items = items

      let sortedItems = await sut['applySort'](sut.items, 'name', 'asc')
      expect(sortedItems).toStrictEqual([
        sut.items[2],
        sut.items[1],
        sut.items[0],
      ])

      sortedItems = await sut['applySort'](sut.items, 'name', 'desc')
      expect(sortedItems).toStrictEqual([
        sut.items[0],
        sut.items[1],
        sut.items[2],
      ])
    })

    it('should sort by email field', async () => {
      const items = [
        UsersDataBuilder({ email: 'c@a.com' }),
        UsersDataBuilder({ email: 'b@a.com' }),
        UsersDataBuilder({ email: 'a@a.com' }),
      ]
      sut.items = items

      let sortedItems = await sut['applySort'](sut.items, 'email', 'asc')
      expect(sortedItems).toStrictEqual([
        sut.items[2],
        sut.items[1],
        sut.items[0],
      ])

      sortedItems = await sut['applySort'](sut.items, 'email', 'desc')
      expect(sortedItems).toStrictEqual([
        sut.items[0],
        sut.items[1],
        sut.items[2],
      ])
    })
  })
})
