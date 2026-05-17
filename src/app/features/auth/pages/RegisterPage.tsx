import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/app/features/auth/context/AuthContext";

type Field = "username" | "email" | "password" | "password_confirm";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isApiError(e: unknown): e is { status: number; message: string } {
  return typeof e === "object" && e !== null && "status" in e;
}

export function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<Record<Field, string>>({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [k]: e.target.value });
    setServerErr(null);
  };
  const blur = (k: Field) => () => setTouched((t) => ({ ...t, [k]: true }));

  /* ── Per-field validation (only shown after blur / submit) ── */
  const validate = (field: Field, values = form): string | null => {
    switch (field) {
      case "username":
        if (!values.username) return t("auth.usernameRequired");
        if (values.username.length < 2) return t("auth.usernameTooShort");
        return null;
      case "email":
        if (!values.email) return t("auth.emailRequired");
        if (!EMAIL_RE.test(values.email)) return t("auth.invalidEmail");
        return null;
      case "password":
        if (!values.password) return t("auth.passwordRequired");
        if (values.password.length < 8) return t("auth.passwordTooShort");
        return null;
      case "password_confirm":
        if (!values.password_confirm) return t("auth.passwordConfirmRequired");
        if (values.password_confirm !== values.password) return t("auth.passwordMismatch");
        return null;
    }
  };

  const fieldError = (f: Field) =>
    touched[f] ? validate(f) : null;

  /* ── Server error mapping ── */
  const mapServerError = (err: unknown): string => {
    const msg = (isApiError(err) ? err.message : String(err)).toLowerCase();
    if (msg.includes("email") && (msg.includes("exist") || msg.includes("taken") || msg.includes("already")))
      return t("auth.emailExists");
    if (msg.includes("username") && (msg.includes("exist") || msg.includes("taken") || msg.includes("already")))
      return t("auth.usernameExists");
    if (isApiError(err) && err.status === 400) return t("auth.registerFailed");
    return t("auth.registerFailed");
  };

  const fields: Field[] = ["username", "email", "password", "password_confirm"];
  const isFormValid = fields.every((f) => validate(f, form) === null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Touch all fields to trigger validation UI
    setTouched({ username: true, email: true, password: true, password_confirm: true });
    setServerErr(null);
    if (!isFormValid) return;

    setSubmitting(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setServerErr(mapServerError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (f: Field) => [
    "w-full px-3 py-2.5 rounded-lg border bg-background transition-colors",
    fieldError(f) ? "border-destructive" : "border-border",
  ].join(" ");

  return (
    <div className="max-w-md mx-auto pt-8">
      <h1 className="mb-2">{t("auth.createAccount")}</h1>
      <p className="text-muted-foreground mb-6">{t("auth.joinSub")}</p>

      <form onSubmit={onSubmit} noValidate className="space-y-4 bg-card border border-border rounded-xl p-6">

        {/* Server-level error banner */}
        {serverErr && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="text-sm">{serverErr}</span>
          </div>
        )}

        {/* Username */}
        <FieldGroup
          id="reg-username"
          label={t("auth.username")}
          error={fieldError("username")}
        >
          <input
            id="reg-username"
            type="text"
            value={form.username}
            onChange={set("username")}
            onBlur={blur("username")}
            autoComplete="username"
            className={inputClass("username")}
          />
        </FieldGroup>

        {/* Email */}
        <FieldGroup
          id="reg-email"
          label={t("auth.email")}
          error={fieldError("email")}
        >
          <input
            id="reg-email"
            type="email"
            value={form.email}
            onChange={set("email")}
            onBlur={blur("email")}
            autoComplete="email"
            className={inputClass("email")}
          />
        </FieldGroup>

        {/* Password */}
        <FieldGroup
          id="reg-password"
          label={t("auth.password")}
          error={fieldError("password")}
        >
          <div className="relative">
            <input
              id="reg-password"
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              onBlur={blur("password")}
              autoComplete="new-password"
              className={[inputClass("password"), "pr-12"].join(" ")}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showPw ? t("common.hidePassword") : t("common.showPassword")}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FieldGroup>

        {/* Confirm password */}
        <FieldGroup
          id="reg-pw-confirm"
          label={t("auth.passwordConfirm")}
          error={fieldError("password_confirm")}
        >
          <div className="relative">
            <input
              id="reg-pw-confirm"
              type={showConfirm ? "text" : "password"}
              value={form.password_confirm}
              onChange={set("password_confirm")}
              onBlur={blur("password_confirm")}
              autoComplete="new-password"
              className={[inputClass("password_confirm"), "pr-12"].join(" ")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showConfirm ? t("common.hidePassword") : t("common.showPassword")}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FieldGroup>

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {submitting ? t("auth.registering") : t("auth.register")}
        </button>

        <p className="text-muted-foreground text-center">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="underline hover:text-foreground transition-colors">
            {t("auth.signInLink")}
          </Link>
        </p>
      </form>
    </div>
  );
}

/* ── Field group wrapper ── */
function FieldGroup({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-muted-foreground text-sm">
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-destructive" style={{ fontSize: "0.78rem" }}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
