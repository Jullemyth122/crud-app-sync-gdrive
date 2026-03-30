import type { User, FormState } from "../config/types";

/**
 * Creates a new user with an auto-incremented ID.
 */
export function createUser(users: User[], form: FormState): User {
  const id = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  return { id, ...form };
}

/**
 * Updates a user by ID with partial form changes.
 */
export function updateUserById(
  users: User[],
  id: number,
  changes: Partial<FormState>,
): User[] {
  return users.map((user) => (user.id === id ? { ...user, ...changes } : user));
}

/**
 * Deletes a user by ID.
 */
export function deleteUserById(users: User[], id: number): User[] {
  return users.filter((user) => user.id !== id);
}
