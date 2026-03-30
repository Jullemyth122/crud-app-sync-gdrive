/**
 * hooks/useUserCrud.ts
 *
 * Extends the base CRUD hook with Google Drive persistence.
 * Every mutation (add / update / delete) automatically saves to Drive.
 */

import { useState, useCallback } from "react";
import type { User, FormState, EditingId } from "../config/types";
import { INITIAL_FORM } from "../config/types";
import {
  createUser,
  updateUserById,
  deleteUserById,
} from "../function/userHandler";
import { saveUsersToDrive } from "../function/driveSync";

type SyncStatus = "idle" | "saving" | "saved" | "error";

interface UseUserCrudOptions {
  /** OAuth2 access token. Pass null when user is not signed in. */
  accessToken: string | null;
}

export function useUserCrud({ accessToken }: UseUserCrudOptions) {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<EditingId>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");

  // ── Drive persistence ────────────────────────────────────────────────────

  const persistToDrive = useCallback(
    async (updatedUsers: User[]) => {
      if (!accessToken) return;
      setSyncStatus("saving");
      try {
        await saveUsersToDrive(accessToken, updatedUsers);
        setSyncStatus("saved");
      } catch (err) {
        console.error("[useUserCrud] Drive save failed:", err);
        setSyncStatus("error");
      }
    },
    [accessToken],
  );

  // ── Mutators (each calls persistToDrive after local state update) ────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let updatedUsers: User[];

    if (editingId !== null) {
      updatedUsers = updateUserById(users, editingId, form);
      setEditingId(null);
    } else {
      updatedUsers = [...users, createUser(users, form)];
    }

    setUsers(updatedUsers);
    setForm(INITIAL_FORM);
    await persistToDrive(updatedUsers);
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, phone: user.phone });
  };

  const handleDelete = async (id: number) => {
    const updatedUsers = deleteUserById(users, id);
    setUsers(updatedUsers);
    await persistToDrive(updatedUsers);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  return {
    // state
    users,
    setUsers, // exposed so App can hydrate from Drive on sign-in
    form,
    editingId,
    syncStatus,
    // handlers
    handleChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCancel,
  };
}
