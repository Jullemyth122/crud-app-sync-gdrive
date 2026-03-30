/**
 * functions/driveSync.ts
 *
 * Treats a single JSON file in Google Drive as a lightweight database.
 *
 * Strategy:
 *   - On load  → search Drive for the file by name; read it if found, create it if not.
 *   - On save  → overwrite the file content with the latest users array.
 *
 * All functions require a valid OAuth2 access token (from googleAuth.ts).
 */

import type { User } from "../config/types";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const FILE_NAME = import.meta.env.VITE_DRIVE_FILE_NAME ?? "crud-app-users.json";

// ─── helpers ────────────────────────────────────────────────────────────────

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function assertOk(res: Response, context: string): Promise<void> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[driveSync] ${context} failed (${res.status}): ${body}`);
  }
}

// ─── file discovery ──────────────────────────────────────────────────────────

/**
 * Searches Drive for our JSON file and returns its file ID, or null if not found.
 */
export async function findDriveFileId(token: string): Promise<string | null> {
  const query = encodeURIComponent(
    `name='${FILE_NAME}' and mimeType='application/json' and trashed=false`,
  );
  const res = await fetch(
    `${DRIVE_API}/files?q=${query}&fields=files(id,name)`,
    {
      headers: authHeaders(token),
    },
  );
  await assertOk(res, "findDriveFileId");
  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

// ─── read ────────────────────────────────────────────────────────────────────

/**
 * Downloads the JSON file from Drive and parses it as a User array.
 * Returns an empty array if the file doesn't exist yet.
 */
export async function loadUsersFromDrive(token: string): Promise<User[]> {
  const fileId = await findDriveFileId(token);
  if (!fileId) return [];

  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: authHeaders(token),
  });
  await assertOk(res, "loadUsersFromDrive");

  const users: User[] = await res.json();
  return Array.isArray(users) ? users : [];
}

// ─── write ───────────────────────────────────────────────────────────────────

/**
 * Creates a new JSON file in Drive with the given users array.
 * Uses multipart upload to set both metadata and content in one request.
 */
async function createDriveFile(token: string, users: User[]): Promise<string> {
  const metadata = { name: FILE_NAME, mimeType: "application/json" };
  const body = JSON.stringify(users, null, 2);

  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    body +
    closeDelimiter;

  const res = await fetch(
    `${UPLOAD_API}/files?uploadType=multipart&fields=id`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    },
  );
  await assertOk(res, "createDriveFile");
  const data = await res.json();
  return data.id as string;
}

/**
 * Overwrites an existing Drive file with the new users array.
 */
async function updateDriveFile(
  token: string,
  fileId: string,
  users: User[],
): Promise<void> {
  const body = JSON.stringify(users, null, 2);
  const res = await fetch(`${UPLOAD_API}/files/${fileId}?uploadType=media`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  });
  await assertOk(res, "updateDriveFile");
}

/**
 * Saves the users array to Drive — creates the file if it doesn't exist,
 * otherwise overwrites it. Returns the file ID.
 */
export async function saveUsersToDrive(
  token: string,
  users: User[],
): Promise<string> {
  const fileId = await findDriveFileId(token);
  if (fileId) {
    await updateDriveFile(token, fileId, users);
    return fileId;
  }
  return createDriveFile(token, users);
}
