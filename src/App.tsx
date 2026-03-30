/**
 * App.tsx  —  redesigned with "Terminal Ledger" aesthetic
 */

import "./App.css";
import { useEffect, useState } from "react";
import { useGoogleAuth } from "./hooks/useGoogleAuth";
import { useUserCrud } from "./hooks/useUserCrud";
import { loadUsersFromDrive } from "./function/driveSync";
import { UserForm } from "./components/UserForm";
import { UserTable } from "./components/UserTable";
import { SyncBadge } from "./components/SyncBadge";

// ── Google "G" icon (inline SVG, no extra dep) ─────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function App() {
  const { accessToken, authStatus, authError, signIn, signOut } = useGoogleAuth();
  const [isHydrating, setIsHydrating] = useState(false);

  const {
    users,
    setUsers,
    form,
    editingId,
    syncStatus,
    handleChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCancel,
  } = useUserCrud({ accessToken });

  // ── Hydrate from Drive on sign-in ────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;
    setIsHydrating(true);
    loadUsersFromDrive(accessToken)
      .then((driveUsers) => setUsers(driveUsers))
      .catch((err) => console.error("[App] Failed to load from Drive:", err))
      .finally(() => setIsHydrating(false));
  }, [accessToken, setUsers]);

  // ── Loading state ────────────────────────────────────────────────────────
  if (authStatus === "loading") {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Initialising Google Identity Services…</span>
      </div>
    );
  }

  // ── Auth gate ────────────────────────────────────────────────────────────
  if (authStatus === "unauthenticated" || authStatus === "error") {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-logo">📋</div>
          <h1>User <span>CRUD</span></h1>
          <p>Sign in with Google to load and sync your data to Drive.</p>
          <button onClick={signIn} className="btn-google">
            <GoogleIcon />
            Sign in with Google
          </button>
          {authError && (
            <div className="error-banner">⚠ {authError}</div>
          )}
        </div>
      </div>
    );
  }

  // ── Main app ─────────────────────────────────────────────────────────────
  return (
    <main>
      <header className="app-header">
        <h1>Users <span> To do List</span></h1>
        <div className="header-right">
          <SyncBadge status={syncStatus} />
          <span className="user-count">{users.length} users</span>
          <button onClick={signOut} className="btn btn-ghost">
            Sign out
          </button>
        </div>
      </header>

      {isHydrating ? (
        <div className="hydrating">
          <div className="spinner" />
          Loading data from Drive…
        </div>
      ) : (
        <>
          <UserForm
            form={form}
            isEditing={editingId !== null}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
          <UserTable
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
            editingId={editingId}
          />
        </>
      )}
    </main>
  );
}

export default App;