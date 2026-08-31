import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CircleNotch,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  Key,
} from "@phosphor-icons/react";
import { useAuth } from "@/contexts/auth";
import { supabaseConfigurationError } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "sign-in" | "sign-up" | "forgot-password";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export default function Auth() {
  const { user, loading: authLoading, signIn, signUp, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    setMessage(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (supabaseConfigurationError) {
      setError(supabaseConfigurationError);
      return;
    }

    if (mode === "sign-up" && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);

    if (mode === "forgot-password") {
      const result = await sendPasswordReset(email);
      setSubmitting(false);

      if (result.ok === false) {
        setError(result.message);
        return;
      }

      setMessage("Un lien de réinitialisation vient d’être envoyé si ce compte existe.");
      return;
    }

    const result =
      mode === "sign-in"
        ? await signIn(email, password)
        : await signUp(email, password);
    setSubmitting(false);

    if (result.ok === false) {
      setError(result.message);
      return;
    }

    if (result.requiresEmailConfirmation) {
      setMessage("Compte créé. Confirmez votre adresse email pour vous connecter.");
      setMode("sign-in");
      setPassword("");
      setConfirmPassword("");
      return;
    }

    const state = location.state as LocationState | null;
    navigate(state?.from?.pathname || "/dashboard", { replace: true });
  };

  const title =
    mode === "sign-in"
      ? "Retrouvez votre espace"
      : mode === "sign-up"
        ? "Créez votre espace"
        : "Réinitialisez votre accès";

  const description =
    mode === "sign-in"
      ? "Connectez-vous pour reprendre vos projets là où vous les avez laissés."
      : mode === "sign-up"
        ? "Un compte suffit pour garder vos projets, tâches et OKR privés."
        : "Saisissez votre email et nous vous enverrons un lien sécurisé.";

  return (
    <main className="min-h-screen bg-[#f5f5f2] p-3 text-[#171714] sm:p-5 dark:bg-[#111210] dark:text-[#f5f5f2]">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1380px] overflow-hidden rounded-[1.4rem] bg-background shadow-[0_24px_80px_-36px_rgba(36,38,31,0.38)] sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-[#1d211b] p-12 text-[#f7f7f2] lg:flex lg:flex-col">
          <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_20%_15%,rgba(173,194,116,0.26),transparent_34%),radial-gradient(circle_at_80%_78%,rgba(104,126,86,0.22),transparent_32%)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:48px_48px]" />

          <div className="relative flex items-center gap-3 text-sm font-semibold tracking-tight">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-[#f2f4eb] p-1.5">
              <img src="/panth-logo.svg" alt="" className="h-full w-full object-contain" />
            </span>
            Pantheon Capital Management
          </div>

          <div className="relative my-auto max-w-xl py-16">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-[#b9c4a6]">
              Espace de travail privé
            </p>
            <h1 className="text-balance text-[clamp(2.8rem,5vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
              Vos décisions avancent avec vos projets.
            </h1>
            <p className="mt-7 max-w-[31rem] text-pretty text-base leading-7 text-[#c6cabf]">
              Centralisez les responsabilités, suivez la progression et gardez les objectifs lisibles pour toute l’équipe.
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-sm text-[#c6cabf]">
            {["Projets lisibles", "OKR mesurables", "Données privées"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#dbe8aa]" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-full items-center justify-center px-5 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-[440px]">
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white p-1.5 shadow-sm dark:bg-[#eceee7]">
                <img src="/panth-logo.svg" alt="" className="h-full w-full object-contain" />
              </span>
              <span className="font-semibold">Pantheon Capital Management</span>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                {mode === "sign-in" ? "Bon retour" : mode === "sign-up" ? "Nouveau compte" : "Mot de passe oublié"}
              </p>
              <h2 className="text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                {title}
              </h2>
              <p className="mt-3 max-w-md text-pretty text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>

            {supabaseConfigurationError && (
              <Alert variant="destructive" className="mb-5">
                <AlertDescription>{supabaseConfigurationError}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-5" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="mb-5 border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <div className="relative">
                  <EnvelopeSimple className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 rounded-xl pl-10"
                    placeholder="vous@entreprise.fr"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {mode !== "forgot-password" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    {mode === "sign-in" && (
                      <button
                        type="button"
                        onClick={() => switchMode("forgot-password")}
                        className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                      >
                        Mot de passe oublié
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Key className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-12 rounded-xl px-10"
                      placeholder="8 caractères minimum"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === "sign-up" && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="h-12 rounded-xl"
                    minLength={8}
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="h-12 w-full rounded-xl text-sm transition-transform active:scale-[0.99]"
                disabled={submitting || authLoading || Boolean(supabaseConfigurationError)}
              >
                {submitting ? (
                  <CircleNotch className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {mode === "sign-in"
                      ? "Se connecter"
                      : mode === "sign-up"
                        ? "Créer mon compte"
                        : "Envoyer le lien"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-7 text-center text-sm text-muted-foreground">
              {mode === "sign-in" && (
                <>
                  Pas encore de compte ?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("sign-up")}
                    className="font-semibold text-foreground underline-offset-4 hover:underline"
                  >
                    Créer un espace
                  </button>
                </>
              )}
              {mode === "sign-up" && (
                <>
                  Déjà inscrit ?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("sign-in")}
                    className="font-semibold text-foreground underline-offset-4 hover:underline"
                  >
                    Se connecter
                  </button>
                </>
              )}
              {mode === "forgot-password" && (
                <button
                  type="button"
                  onClick={() => switchMode("sign-in")}
                  className="font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  Revenir à la connexion
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
