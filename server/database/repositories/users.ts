import { db } from '../db'
import type { NewUser, UserUpdate } from '../types'

export async function findUserByGithubId(githubId: string) {
  return await db
    .selectFrom('users')
    .where('github_id', '=', githubId)
    .selectAll()
    .executeTakeFirst()
}

export async function findUserById(id: number) {
  return await db
    .selectFrom('users')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst()
}

export async function createUser(user: NewUser) {
  return await db
    .insertInto('users')
    .values({
      ...user,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateUser(id: number, updateWith: UserUpdate) {
  return await db
    .updateTable('users')
    .set(updateWith)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()
}

export async function deleteUser(id: number) {
  return await db
    .deleteFrom('users')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()
}

export async function getAllUsers() {
  return await db
    .selectFrom('users')
    .selectAll()
    .orderBy('created_at', 'desc')
    .execute()
}

export async function isAdmin(userId: number) {
  const user = await db
    .selectFrom('users')
    .where('id', '=', userId)
    .select('is_admin')
    .executeTakeFirst()
  return user?.is_admin ?? false
}