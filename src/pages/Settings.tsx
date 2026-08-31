import { useState } from "react";
import {
  Check,
  CircleNotch,
  Desktop,
  EnvelopeSimple,
  Key,
  Moon,
  ShieldCheck,
  SignOut,
  Sun,
  UserCircle,
} from "@phosphor-icons/react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

const themes = [
  { value: "light" as const, label: "Clair", icon: Sun },
  { value: "dark" as const, label: "Sombre", icon: Moon },
  { value: "system" as const, label: "Système", icon: Desktop },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, sendPasswordReset, signOut } = useAuth();
  const { toast } = useToast();
  const [sendingReset, setSendingReset] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast({
        title: "Adresse email indisponible",
        description: "Impossible d’envoyer le lien de réinitialisation.",
        variant: "destructive",
      });
      return;
    }

    setSendingReset(true);
    const result = await sendPasswordReset(user.email);
    setSendingReset(false);

    if (result.ok === false) {
      toast({
        title: "Envoi impossible",
        description: result.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Email envoyé",
      description: "Consultez votre boîte mail pour modifier votre mot de passe.",
    });
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    const result = await signOut();
    setSigningOut(false);

    if (result.ok === false) {
      toast({
        title: "Déconnexion impossible",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto max-w-[1160px] p-5 sm:p-8 lg:p-10">
      <header className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Configuration
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
          Paramètres
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Gérez votre compte, l’apparence de l’interface et les accès à votre
          espace privé.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-10">
          <section>
            <div className="flex items-center gap-3">
              <UserCircle className="h-5 w-5 text-muted-foreground" weight="duotone" />
              <div>
                <h2 className="text-base font-semibold">Compte</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Informations utilisées pour votre connexion.
                </p>
              </div>
            </div>

            <div className="mt-5 divide-y divide-border/70 border-y border-border/70">
              <div className="grid gap-2 py-5 sm:grid-cols-[190px_1fr] sm:items-center">
                <span className="text-sm text-muted-foreground">Adresse email</span>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <EnvelopeSimple className="h-4 w-4 text-muted-foreground" />
                  {user?.email || "Adresse indisponible"}
                </div>
              </div>
              <div className="grid gap-2 py-5 sm:grid-cols-[190px_1fr] sm:items-center">
                <span className="text-sm text-muted-foreground">Type d’espace</span>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" weight="fill" />
                  Espace privé isolé
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3">
              <Desktop className="h-5 w-5 text-muted-foreground" weight="duotone" />
              <div>
                <h2 className="text-base font-semibold">Apparence</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Le choix est enregistré sur cet appareil.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {themes.map(({ value, label, icon: Icon }) => {
                const selected = theme === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    className={`relative rounded-2xl border p-4 text-left outline-none transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring ${
                      selected
                        ? "border-[#68764f] bg-[#eef1e6] dark:border-[#9dab7f] dark:bg-[#252a21]"
                        : "border-border/70 hover:border-foreground/25 hover:bg-muted/30"
                    }`}
                  >
                    <Icon className="h-5 w-5" weight="duotone" />
                    <span className="mt-5 block text-sm font-semibold">{label}</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {value === "system"
                        ? "Suit votre appareil"
                        : `Interface ${label.toLowerCase()}`}
                    </span>
                    {selected && (
                      <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-[#68764f] text-white">
                        <Check className="h-3 w-3" weight="bold" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-muted-foreground" weight="duotone" />
              <div>
                <h2 className="text-base font-semibold">Sécurité</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Contrôlez votre mot de passe et votre session.
                </p>
              </div>
            </div>

            <div className="mt-5 divide-y divide-border/70 border-y border-border/70">
              <div className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-medium">Mot de passe</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Recevez un lien sécurisé à l’adresse de votre compte.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => void handlePasswordReset()}
                  disabled={sendingReset}
                  className="rounded-xl"
                >
                  {sendingReset && (
                    <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Envoyer le lien
                </Button>
              </div>

              <div className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-medium">Session actuelle</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Fermez cette session sur cet appareil.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => void handleSignOut()}
                  disabled={signingOut}
                  className="justify-start rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {signingOut ? (
                    <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <SignOut className="mr-2 h-4 w-4" />
                  )}
                  Se déconnecter
                </Button>
              </div>
            </div>
          </section>
        </main>

        <aside className="h-fit rounded-2xl bg-[#20231e] p-6 text-[#f1f3ec] dark:bg-[#e7eadf] dark:text-[#1d201a]">
          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-[#f2f4eb] p-2">
            <img src="/panth-logo.svg" alt="" className="h-full w-full object-contain" />
          </span>
          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#aeb5a4] dark:text-[#687061]">
            Espace de travail
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
            Pantheon Capital Management
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#bdc3b7] dark:text-[#596052]">
            Vos projets, tâches, notes et objectifs sont isolés par votre compte
            Supabase.
          </p>
          <div className="mt-6 border-t border-white/10 pt-5 dark:border-black/10">
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-[#c9d99a]" />
              Protection RLS active
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
