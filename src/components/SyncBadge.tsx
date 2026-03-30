/**
 * components/SyncBadge.tsx
 * Small indicator showing the current Drive sync state.
 */

interface SyncBadgeProps {
    status: "idle" | "saving" | "saved" | "error";
}

const LABELS: Record<SyncBadgeProps["status"], string> = {
    idle: "",
    saving: "⏳ Saving to Drive…",
    saved: "✅ Saved to Drive",
    error: "❌ Drive save failed",
};

export function SyncBadge({ status }: SyncBadgeProps) {
    if (status === "idle") return null;
    return <span className="sync-badge" data-status={status}>{LABELS[status]}</span>;
}