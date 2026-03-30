/**
 * hooks/useGoogleAuth.ts
 *
 * FIX: `initTokenClient` is called INSIDE `.then()` of
 * `loadGoogleIdentityServices()` so the `google` global is guaranteed
 * to exist before we touch it.
 */

import { useCallback, useEffect, useState } from "react";
import {
  initTokenClient,
  loadGoogleIdentityServices,
  requestAccessToken,
  revokeToken,
} from "../function/googleAuth";

type AuthStatus = "loading" | "unauthenticated" | "authenticated" | "error";

export function useGoogleAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    loadGoogleIdentityServices()
      .then(() => {
        // ✅ `google` global is available here — script has fully loaded
        initTokenClient(
          (token) => {
            setAccessToken(token);
            setAuthStatus("authenticated");
            setAuthError(null);
          },
          (err) => {
            setAuthError(err);
            setAuthStatus("error");
          },
        );
        setAuthStatus("unauthenticated");
      })
      .catch((err: Error) => {
        setAuthError(err.message);
        setAuthStatus("error");
      });
  }, []); // runs once on mount

  const signIn = useCallback(() => {
    try {
      requestAccessToken();
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : "Unknown sign-in error");
      setAuthStatus("error");
    }
  }, []);

  const signOut = useCallback(async () => {
    await revokeToken();
    setAccessToken(null);
    setAuthStatus("unauthenticated");
    setAuthError(null);
  }, []);

  return { accessToken, authStatus, authError, signIn, signOut };
}
