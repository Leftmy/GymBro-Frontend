import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/app/features/auth/context/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isApiError(e: unknown): e is { status: number; message: string } {
  return typeof e === "object" && e !== null && "status" in e;
}

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("alex@gymbro.app");
  const [password, setPassword] = useState("password");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ── Inline validation ── */
  const emailErr = (() => {
    if (!touched.email) return null;
    if (!email) return t("auth.emailRequired");
    if (!EMAIL_RE.test(email)) return t("auth.invalidEmail");
    return null;
  })();

  const passwordErr = (() => {
    if (!touched.password) return null;
    if (!password) return t("auth.passwordRequired");
    if (password.length < 8) return t("auth.passwordTooShort");
    return null;
  })();

  const isFormValid = EMAIL_RE.test(email) && password.length >= 1;

  /* ── Server error mapping ── */
  const mapServerError = (err: unknown): string => {
    if (isApiError(err)) {
      if (err.status === 401 || err.status === 400) return t("auth.incorrectCredentials");
    }
    return t("auth.loginFailed");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setServerErr(null);

    // Run all validations
    if (!EMAIL_RE.test(email) || !password) return;

    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setServerErr(mapServerError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-8">
      <h1 className="mb-2">{t("auth.welcome")}</h1>
      <p className="text-muted-foreground mb-6">{t("auth.welcomeSub")}</p>

      <form onSubmit={onSubmit} noValidate className="space-y-5 bg-card border border-border rounded-xl p-6">

        {/* Server-level error banner */}
        {serverErr && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="text-sm">{serverErr}</span>
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-muted-foreground text-sm" htmlFor="login-email">
            {t("auth.email")}
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setServerErr(null); }}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            autoComplete="email"
            className={[
              "w-full px-3 py-2.5 rounded-lg border bg-background transition-colors",
              emailErr ? "border-destructive focus:border-destructive" : "border-border",
            ].join(" ")}
          />
          {emailErr && (
            <p className="flex items-center gap-1.5 text-destructive" style={{ fontSize: "0.78rem" }}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {emailErr}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-muted-foreground text-sm" htmlFor="login-password">
            {t("auth.password")}
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setServerErr(null); }}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              autoComplete="current-password"
              className={[
                "w-full px-3 py-2.5 pr-12 rounded-lg border bg-background transition-colors",
                passwordErr ? "border-destructive" : "border-border",
              ].join(" ")}
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
          {passwordErr && (
            <p className="flex items-center gap-1.5 text-destructive" style={{ fontSize: "0.78rem" }}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {passwordErr}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || !isFormValid}
          className="w-full px-4 py-2.5 rounded-xl bg-foreground text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {submitting ? t("auth.signingIn") : t("auth.signIn")}
        </button>

        <p className="text-muted-foreground text-center">
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="underline hover:text-foreground transition-colors">
            {t("auth.registerLink")}
          </Link>
        </p>
      </form>
    </div>
  );
}
