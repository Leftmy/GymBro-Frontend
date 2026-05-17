import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Check, X, KeyRound } from "lucide-react";
import { useAuth } from "@/app/features/auth/context/AuthContext";
import { userService } from "@/app/services";

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateUser, logout } = useAuth();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user?.username ?? "", email: user?.email ?? "" });
  const [saving, setSaving] = useState(false);

  const [pwOpen, setPwOpen] = useState(false);

  if (!user) return null;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updated = await userService.updateProfile(form);
    updateUser(updated);
    setSaving(false);
    setEditing(false);
  };

  const onCancel = () => {
    setForm({ username: user.username, email: user.email });
    setEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1>{t("profile.title")}</h1>
        <p className="text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      {/* ── Profile card ── */}
      <div className="bg-card border border-border rounded-xl p-6">
        {/* Avatar row */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center shrink-0"
          >
            <span>{user.username[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="truncate">{user.username}</h2>
            <p className="text-muted-foreground truncate">{user.email}</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
            >
              {t("profile.edit")}
            </button>
          )}
        </div>

        {/* Meta info */}
        <dl className="grid sm:grid-cols-2 gap-4 mt-6 text-muted-foreground">
          <div>
            <dt>{t("profile.role")}</dt>
            <dd className="text-foreground capitalize">{user.role}</dd>
          </div>
          <div>
            <dt>{t("profile.memberSince")}</dt>
            <dd className="text-foreground">{new Date(user.created_at).toLocaleDateString()}</dd>
          </div>
        </dl>

        {/* Edit form */}
        {editing && (
          <form onSubmit={onSave} className="mt-6 space-y-3 border-t border-border pt-4">
            <label className="block">
              <span className="text-muted-foreground">{t("auth.username")}</span>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background"
              />
            </label>
            <label className="block">
              <span className="text-muted-foreground">{t("auth.email")}</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-background"
              />
            </label>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
              >
                {t("profile.cancel")}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-1.5 rounded-lg bg-foreground text-background disabled:opacity-50"
              >
                {saving ? t("profile.saving") : t("profile.save")}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Security card ── */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "color-mix(in oklab, var(--accent-orange) 15%, transparent)" }}
            >
              <KeyRound className="w-5 h-5" style={{ color: "var(--accent-orange)" }} />
            </div>
            <div>
              <p>{t("profile.changePassword")}</p>
              <p className="text-muted-foreground text-sm">••••••••</p>
            </div>
          </div>
          <button
            onClick={() => setPwOpen(true)}
            className="shrink-0 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-sm"
          >
            {t("profile.changePassword")}
          </button>
        </div>
      </div>

      {/* ── Change Password Modal ── */}
      {pwOpen && (
        <ChangePasswordModal
          onClose={() => setPwOpen(false)}
          onLogout={logout}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────── ChangePasswordModal ─── */
function ChangePasswordModal({
  onClose,
  onLogout,
}: {
  onClose: () => void;
  onLogout: () => void;
}) {
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = password.length > 0 && passwordConfirm.length > 0 && password !== passwordConfirm;
  const valid = password.length >= 1 && password === passwordConfirm && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    try {
      await userService.updateProfile({ password, password_confirm: passwordConfirm });
      setSuccess(true);
      setPassword("");
      setPasswordConfirm("");
    } catch (err: unknown) {
      const msg =
        (err as { data?: { detail?: string }; message?: string })?.data?.detail ??
        (err as { message?: string })?.message ??
        "Unknown error";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoutAndClose = () => {
    onClose();
    onLogout();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-muted-foreground" />
            <h2>{t("profile.changePassword")}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label={t("common.cancel")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            /* ── Success state ── */
            <div className="space-y-4 text-center">
              <div
                className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
                style={{ backgroundColor: "color-mix(in oklab, var(--accent-lime) 20%, transparent)" }}
              >
                <Check className="w-7 h-7" style={{ color: "var(--accent-lime)" }} />
              </div>
              <div>
                <p>{t("profile.passwordChanged")}</p>
                <p className="text-muted-foreground text-sm mt-1">{t("profile.reloginHint")}</p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleLogoutAndClose}
                  className="w-full px-4 py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                  {t("profile.signOutNow")}
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-sm text-muted-foreground"
                >
                  {t("profile.cancel")}
                </button>
              </div>
            </div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New password */}
              <div className="space-y-1.5">
                <label className="block text-muted-foreground text-sm">
                  {t("profile.newPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-3 py-2.5 pr-16 rounded-lg border border-border bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs"
                  >
                    {showPw ? (
                      <><EyeOff className="w-4 h-4 inline" /></>
                    ) : (
                      <><Eye className="w-4 h-4 inline" /></>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="block text-muted-foreground text-sm">
                  {t("profile.confirmNewPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    autoComplete="new-password"
                    className={[
                      "w-full px-3 py-2.5 pr-16 rounded-lg border bg-background",
                      mismatch ? "border-destructive" : "border-border",
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {mismatch && (
                  <p className="text-destructive text-sm">{t("auth.passwordMismatch")}</p>
                )}
              </div>

              {/* API error */}
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  {t("profile.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={!valid}
                  className="px-4 py-2 rounded-lg bg-foreground text-background disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  {submitting ? t("profile.changingPassword") : t("profile.changePassword")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
