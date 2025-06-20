import { container } from 'tsyringe'
import '@/products/infrastructure/container'
import '@/users/infrastructure/container'
import { BcryptjsHashProvider } from '../providers/hash-provider/bcryptjs-hash.provider'
import { JwtAuthProvider } from '../providers/auth-provider/auth-provider.jwt'

container.registerSingleton('HashProvider', BcryptjsHashProvider)
container.registerSingleton('AuthProvider', JwtAuthProvider)
