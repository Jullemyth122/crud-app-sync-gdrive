/**
 * functions/googleAuth.ts
 *
 * Handles Google OAuth2 token acquisition via the GIS (Google Identity Services)
 * token model — no redirect, works entirely in-browser for local dev.
 *
 * Scopes requested:
 *   - drive.file  →  read/write only files THIS app created (least privilege)
 */

const SCOPES = "https://www.googleapis.com/auth/drive.file";

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let accessToken: string | null = null;

/** Load the GIS script dynamically (called once at app start). */
export function loadGoogleIdentityServices(): Promise<void> {
  return new Promise((resolve, reject) => {
    // If the library is already fully loaded
    if (typeof google !== "undefined" && google.accounts) {
      resolve();
      return;
    }

    const existingScript = document.getElementById("gis-script");
    if (existingScript) {
      // Script exists but might not have finished loading yet (strict mode double-mount)
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Identity Services")));
      return;
    }

    const script = document.createElement("script");
    script.id = "gis-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

/** Initialise the token client (call after loadGoogleIdentityServices resolves). */
export function initTokenClient(
  onTokenReceived: (token: string) => void,
  onError: (err: string) => void,
): void {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
  if (!clientId) throw new Error("VITE_GOOGLE_CLIENT_ID is not set in .env");

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (response) => {
      if (response.error) {
        onError(response.error);
        return;
      }
      accessToken = response.access_token;
      onTokenReceived(response.access_token);
    },
  });
}

/** Opens the Google sign-in popup and requests an access token. */
export function requestAccessToken(): void {
  if (!tokenClient) throw new Error("Token client not initialised");
  tokenClient.requestAccessToken({ prompt: "consent" });
}

/** Revokes the current token and clears local state. */
export async function revokeToken(): Promise<void> {
  if (!accessToken) return;
  await new Promise<void>((resolve) => {
    google.accounts.oauth2.revoke(accessToken!, () => resolve());
  });
  accessToken = null;
}

/** Returns the current in-memory access token (may be null). */
export function getAccessToken(): string | null {
  return accessToken;
}
