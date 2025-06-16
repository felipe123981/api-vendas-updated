export interface UserModel {
  id: string
  name: string
  email: string
  password: string
  avatar?: string
  created_at: Date
  updated_at: Date
}
