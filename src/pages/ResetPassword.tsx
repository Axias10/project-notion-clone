import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleNotch, Key } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const { user, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    const result = await updatePassword(password);
    setSubmitting(false);

    if (result.ok === false) {
      setError(result.message);
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border bg-background p-7 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.45)] sm:p-9">
        <div className="mb-7 grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Key className="h-5 w-5" weight="duotone" />
        </div>
        <h1 className="text-3xl font-semibold tracking-[-0.04em]">Nouveau mot de passe</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Choisissez un mot de passe unique d’au moins 8 caractères.
        </p>

        {!loading && !user ? (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>
              Ce lien est invalide ou a expiré.{" "}
              <Link to="/auth" className="font-semibold underline underline-offset-4">
                Demander un nouveau lien
              </Link>
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {error && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-xl"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-11 rounded-xl"
                required
              />
            </div>
            <Button type="submit" className="h-11 w-full rounded-xl" disabled={submitting || loading}>
              {submitting ? <CircleNotch className="h-4 w-4 animate-spin" /> : "Enregistrer le mot de passe"}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
