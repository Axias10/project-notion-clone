import { useEffect, useMemo, useState } from "react";
import {
  CaretRight,
  Check,
  CheckCircle,
  Circle,
  Flag,
  MagnifyingGlass,
  Plus,
  Target,
  Trash,
  Warning,
  X,
} from "@phosphor-icons/react";
import { okrService } from "@/services/okrService";
import { KeyResult, OKR } from "@/lib/supabase";
import { InlineTextEdit } from "@/components/InlineTextEdit";
import { PercentageEditor } from "@/components/PercentageEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const STATUS_CONFIG = {
  "on-track": {
    label: "Dans les temps",
    dotClassName: "bg-emerald-500",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    barClassName: "[&>div]:bg-emerald-600",
    icon: CheckCircle,
  },
  "at-risk": {
    label: "À risque",
    dotClassName: "bg-amber-500",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    barClassName: "[&>div]:bg-amber-500",
    icon: Warning,
  },
  "off-track": {
    label: "Hors trajectoire",
    dotClassName: "bg-red-500",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
    barClassName: "[&>div]:bg-red-500",
    icon: Flag,
  },
} satisfies Record<
  OKR["status"],
  {
    label: string;
    dotClassName: string;
    className: string;
    barClassName: string;
    icon: typeof CheckCircle;
  }
>;

const getKeyResults = (okr: OKR): KeyResult[] =>
  Array.isArray(okr.key_results) ? okr.key_results : [];

const getKeyResultPercentage = (keyResult: KeyResult) => {
  const target = keyResult.target > 0 ? keyResult.target : 100;
  return Math.min(
    100,
    Math.max(0, Math.round((keyResult.progress / target) * 100)),
  );
};

const calculateOverallProgress = (keyResults: KeyResult[]) => {
  if (!keyResults.length) return 0;
  return Math.round(
    keyResults.reduce(
      (total, keyResult) => total + getKeyResultPercentage(keyResult),
      0,
    ) / keyResults.length,
  );
};

export default function OKRs() {
  const [okrs, setOKRs] = useState<OKR[]>([]);
  const [selectedOKRId, setSelectedOKRId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddResult, setShowAddResult] = useState(false);
  const [okrToDelete, setOKRToDelete] = useState<OKR | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const [newOKR, setNewOKR] = useState({
    objective: "",
    status: "on-track" as OKR["status"],
    quarter: "",
    key_results: [] as KeyResult[],
  });
  const [newKeyResult, setNewKeyResult] = useState({
    description: "",
    progress: 0,
    target: 100,
  });
  const [resultToAdd, setResultToAdd] = useState({
    description: "",
    progress: 0,
    target: 100,
  });

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await okrService.getAllOKRs();
    setOKRs(data);
    setSelectedOKRId((currentId) => {
      if (currentId && data.some((okr) => okr.id === currentId)) {
        return currentId;
      }
      return data[0]?.id ?? null;
    });
    setLoading(false);
    return data;
  };

  const addResultToDraft = () => {
    const description = newKeyResult.description.trim();
    if (!description) {
      toast({
        title: "Résultat clé requis",
        description: "Ajoutez une description avant de continuer.",
        variant: "destructive",
      });
      return;
    }

    setNewOKR((current) => ({
      ...current,
      key_results: [...current.key_results, { ...newKeyResult, description }],
    }));
    setNewKeyResult({ description: "", progress: 0, target: 100 });
  };

  const handleAddOKR = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newOKR.objective.trim()) {
      toast({
        title: "Objectif requis",
        description: "Donnez un intitulé à l’objectif.",
        variant: "destructive",
      });
      return;
    }
    if (!newOKR.key_results.length) {
      toast({
        title: "Résultat clé requis",
        description: "Ajoutez au moins un résultat mesurable.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    const success = await okrService.addOKR({
      ...newOKR,
      objective: newOKR.objective.trim(),
      quarter: newOKR.quarter.trim() || null,
    });

    if (!success) {
      setCreating(false);
      toast({
        title: "Création impossible",
        description: "L’OKR n’a pas pu être enregistré.",
        variant: "destructive",
      });
      return;
    }

    const refreshedOKRs = await loadData();
    setSelectedOKRId(refreshedOKRs[0]?.id ?? null);
    setCreating(false);
    setShowCreateDialog(false);
    setNewOKR({
      objective: "",
      status: "on-track",
      quarter: "",
      key_results: [],
    });
    setNewKeyResult({ description: "", progress: 0, target: 100 });
    toast({ title: "OKR créé" });
  };

  const handleUpdateOKR = async (
    okrId: number,
    updates: Partial<OKR>,
  ): Promise<boolean> => {
    const success = await okrService.updateOKR(okrId, updates);

    if (!success) {
      toast({
        title: "Modification non enregistrée",
        description: "Vérifiez votre connexion puis réessayez.",
        variant: "destructive",
      });
      return false;
    }

    setOKRs((current) =>
      current.map((okr) => (okr.id === okrId ? { ...okr, ...updates } : okr)),
    );
    return true;
  };

  const updateKeyResults = (okr: OKR, keyResults: KeyResult[]) =>
    handleUpdateOKR(okr.id, { key_results: keyResults });

  const handleUpdateKeyResultProgress = (
    okr: OKR,
    keyResultIndex: number,
    percentage: number,
  ) =>
    updateKeyResults(
      okr,
      getKeyResults(okr).map((keyResult, index) =>
        index === keyResultIndex
          ? { ...keyResult, progress: percentage, target: 100 }
          : keyResult,
      ),
    );

  const handleUpdateKeyResultDescription = (
    okr: OKR,
    keyResultIndex: number,
    description: string,
  ) =>
    updateKeyResults(
      okr,
      getKeyResults(okr).map((keyResult, index) =>
        index === keyResultIndex ? { ...keyResult, description } : keyResult,
      ),
    );

  const handleRemoveKeyResult = (okr: OKR, keyResultIndex: number) =>
    updateKeyResults(
      okr,
      getKeyResults(okr).filter((_, index) => index !== keyResultIndex),
    );

  const handleAddResultToOKR = async (okr: OKR) => {
    const description = resultToAdd.description.trim();
    if (!description) {
      toast({
        title: "Description requise",
        description: "Décrivez le résultat clé à ajouter.",
        variant: "destructive",
      });
      return;
    }

    const saved = await updateKeyResults(okr, [
      ...getKeyResults(okr),
      { ...resultToAdd, description },
    ]);
    if (saved) {
      setResultToAdd({ description: "", progress: 0, target: 100 });
      setShowAddResult(false);
    }
  };

  const handleDeleteOKR = async () => {
    if (!okrToDelete) return;
    const deletedOKRId = okrToDelete.id;
    const success = await okrService.deleteOKR(deletedOKRId);

    if (!success) {
      toast({
        title: "Suppression impossible",
        description: "L’OKR n’a pas pu être supprimé.",
        variant: "destructive",
      });
      return;
    }

    const remainingOKRs = okrs.filter((okr) => okr.id !== deletedOKRId);
    setOKRs(remainingOKRs);
    setSelectedOKRId((currentId) =>
      currentId === deletedOKRId ? (remainingOKRs[0]?.id ?? null) : currentId,
    );
    setOKRToDelete(null);
    toast({ title: "OKR supprimé" });
  };

  const filteredOKRs = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    return okrs.filter((okr) => {
      const matchesSearch =
        !normalizedQuery ||
        okr.objective.toLowerCase().includes(normalizedQuery) ||
        okr.quarter?.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        filterStatus === "all" || okr.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [filterStatus, okrs, searchQuery]);

  const selectedOKR =
    filteredOKRs.find((okr) => okr.id === selectedOKRId) ||
    filteredOKRs[0] ||
    null;

  const selectedKeyResults = selectedOKR ? getKeyResults(selectedOKR) : [];
  const overallProgress = calculateOverallProgress(selectedKeyResults);

  const stats = {
    total: okrs.length,
    onTrack: okrs.filter((okr) => okr.status === "on-track").length,
    atRisk: okrs.filter((okr) => okr.status === "at-risk").length,
    average: okrs.length
      ? Math.round(
          okrs.reduce(
            (total, okr) =>
              total + calculateOverallProgress(getKeyResults(okr)),
            0,
          ) / okrs.length,
        )
      : 0,
  };

  if (loading) {
    return (
      <div className="mx-auto min-h-[calc(100dvh-3.5rem)] max-w-[1480px] p-5 sm:p-8">
        <div className="h-10 w-52 animate-pulse rounded-lg bg-muted" />
        <div className="mt-8 grid min-h-[640px] overflow-hidden rounded-2xl border border-border/60 lg:grid-cols-[340px_1fr]">
          <div className="space-y-3 border-r border-border/60 bg-muted/20 p-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="space-y-8 p-8 lg:p-12">
            <div className="h-12 w-2/3 animate-pulse rounded-xl bg-muted" />
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
            <div className="h-40 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[calc(100dvh-3.5rem)] max-w-[1480px] p-4 sm:p-6 lg:p-8">
      <header className="mb-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Performance framework
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Objectifs & résultats clés
          </h1>
          <p className="mt-2 max-w-[62ch] text-sm leading-6 text-muted-foreground">
            Gardez chaque objectif lisible et mettez à jour les résultats clés
            avec un pourcentage unique.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-6">
          <dl className="flex divide-x divide-border/70">
            {[
              { label: "Objectifs", value: stats.total },
              { label: "Dans les temps", value: stats.onTrack },
              { label: "À risque", value: stats.atRisk },
              { label: "Moyenne", value: `${stats.average}%` },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 first:pl-0">
                <dd className="font-mono text-xl font-semibold tabular-nums">
                  {value}
                </dd>
                <dt className="mt-0.5 text-[11px] text-muted-foreground">
                  {label}
                </dt>
              </div>
            ))}
          </dl>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="h-10 rounded-xl px-4 active:scale-[0.98]">
                <Plus className="mr-2 h-4 w-4" weight="bold" />
                Nouvel OKR
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl tracking-[-0.035em]">
                  Créer un objectif
                </DialogTitle>
                <DialogDescription>
                  Définissez l’objectif, puis les résultats qui permettront de le
                  mesurer.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddOKR} className="mt-2 space-y-6">
                <div className="grid gap-4 sm:grid-cols-[1fr_170px]">
                  <div className="space-y-2">
                    <label htmlFor="okr-objective" className="text-sm font-medium">
                      Objectif
                    </label>
                    <Input
                      id="okr-objective"
                      value={newOKR.objective}
                      onChange={(event) =>
                        setNewOKR({ ...newOKR, objective: event.target.value })
                      }
                      placeholder="Ex. Accélérer la création de valeur"
                      className="h-11 rounded-xl"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="okr-quarter" className="text-sm font-medium">
                      Période
                    </label>
                    <Input
                      id="okr-quarter"
                      value={newOKR.quarter}
                      onChange={(event) =>
                        setNewOKR({ ...newOKR, quarter: event.target.value })
                      }
                      placeholder="T3 2026"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="okr-status" className="text-sm font-medium">
                    Statut initial
                  </label>
                  <Select
                    value={newOKR.status}
                    onValueChange={(value) =>
                      setNewOKR({
                        ...newOKR,
                        status: value as OKR["status"],
                      })
                    }
                  >
                    <SelectTrigger
                      id="okr-status"
                      className="h-11 max-w-56 rounded-xl"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on-track">Dans les temps</SelectItem>
                      <SelectItem value="at-risk">À risque</SelectItem>
                      <SelectItem value="off-track">Hors trajectoire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <section className="space-y-3 border-t border-border/70 pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">Résultats clés</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Ajoutez au moins un indicateur mesurable.
                      </p>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {newOKR.key_results.length}
                    </span>
                  </div>

                  {newOKR.key_results.map((keyResult, index) => (
                    <div
                      key={`${keyResult.description}-${index}`}
                      className="flex items-center gap-3 rounded-xl bg-muted/35 p-3"
                    >
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-background font-mono text-[11px]">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {keyResult.description}
                      </span>
                      <span className="font-mono text-sm font-semibold">
                        {keyResult.progress}%
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() =>
                          setNewOKR((current) => ({
                            ...current,
                            key_results: current.key_results.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          }))
                        }
                        aria-label={`Retirer ${keyResult.description}`}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="grid gap-3 rounded-xl border border-dashed p-3 sm:grid-cols-[1fr_120px_auto]">
                    <Input
                      value={newKeyResult.description}
                      onChange={(event) =>
                        setNewKeyResult({
                          ...newKeyResult,
                          description: event.target.value,
                        })
                      }
                      placeholder="Décrire le résultat clé"
                      className="h-10 rounded-lg"
                    />
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={newKeyResult.progress}
                        onChange={(event) =>
                          setNewKeyResult({
                            ...newKeyResult,
                            progress: Math.min(
                              100,
                              Math.max(0, Number(event.target.value)),
                            ),
                          })
                        }
                        className="h-10 rounded-lg pr-8 font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        %
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addResultToDraft}
                      className="rounded-lg"
                    >
                      Ajouter
                    </Button>
                  </div>
                </section>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? "Création…" : "Créer l’OKR"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid min-h-[650px] overflow-hidden rounded-2xl border border-border/70 bg-background shadow-[0_26px_70px_-48px_rgba(24,24,20,0.45)] lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="border-b border-border/70 bg-muted/20 lg:border-b-0 lg:border-r">
          <div className="space-y-3 border-b border-border/70 p-4">
            <div className="relative">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un objectif"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-10 rounded-xl border-border/60 bg-background pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 rounded-xl border-border/60 bg-background text-xs">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="on-track">Dans les temps</SelectItem>
                <SelectItem value="at-risk">À risque</SelectItem>
                <SelectItem value="off-track">Hors trajectoire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="max-h-[310px] overflow-y-auto p-2 lg:max-h-[calc(100dvh-18rem)]">
            {filteredOKRs.map((okr) => {
              const progress = calculateOverallProgress(getKeyResults(okr));
              const status = STATUS_CONFIG[okr.status];
              const selected = selectedOKR?.id === okr.id;

              return (
                <button
                  key={okr.id}
                  type="button"
                  onClick={() => {
                    setSelectedOKRId(okr.id);
                    setShowAddResult(false);
                  }}
                  className={`group/list mb-1 w-full rounded-xl p-3.5 text-left outline-none transition-[background-color,color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-ring ${
                    selected
                      ? "bg-[#20231e] text-[#f7f7f2] shadow-[0_14px_30px_-24px_rgba(20,24,18,0.8)] dark:bg-[#eceee7] dark:text-[#181a16]"
                      : "hover:translate-x-0.5 hover:bg-background"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${status.dotClassName}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className="line-clamp-2 text-sm font-semibold leading-5">
                          {okr.objective}
                        </span>
                        <CaretRight
                          className={`mt-0.5 h-3.5 w-3.5 shrink-0 transition-transform group-hover/list:translate-x-0.5 ${
                            selected ? "opacity-80" : "text-muted-foreground"
                          }`}
                          weight="bold"
                        />
                      </span>
                      <span
                        className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${
                          selected
                            ? "text-[#bdc3b4] dark:text-[#55594f]"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span>{okr.quarter || status.label}</span>
                        <span className="font-mono">{progress}%</span>
                      </span>
                      <span
                        className={`mt-2 block h-1 overflow-hidden rounded-full ${
                          selected
                            ? "bg-white/15 dark:bg-black/10"
                            : "bg-muted"
                        }`}
                      >
                        <span
                          className={`block h-full rounded-full ${
                            selected
                              ? "bg-[#d4dfaa] dark:bg-[#596446]"
                              : status.dotClassName
                          }`}
                          style={{
                            transform: `translateX(-${100 - progress}%)`,
                          }}
                        />
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}

            {!filteredOKRs.length && (
              <div className="px-4 py-14 text-center">
                <Target className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">
                  {okrs.length ? "Aucun résultat" : "Aucun objectif pour le moment"}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {okrs.length
                    ? "Modifiez la recherche ou le statut."
                    : "Créez un objectif et son premier résultat clé."}
                </p>
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0">
          {selectedOKR ? (
            <div className="p-5 sm:p-7 lg:p-10 xl:p-12">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <Target className="h-4 w-4" weight="duotone" />
                  OKR-{String(selectedOKR.id).padStart(3, "0")}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOKRToDelete(selectedOKR)}
                  className="h-8 rounded-lg px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash className="mr-1.5 h-4 w-4" />
                  Supprimer
                </Button>
              </div>

              <div className="mt-5 max-w-4xl">
                <InlineTextEdit
                  value={selectedOKR.objective}
                  placeholder="Intitulé de l’objectif"
                  ariaLabel="Intitulé de l’objectif"
                  required
                  onSave={(objective) =>
                    handleUpdateOKR(selectedOKR.id, { objective })
                  }
                  displayClassName="py-1 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl"
                  inputClassName="h-14 rounded-xl text-2xl font-semibold tracking-[-0.03em]"
                  iconClassName="mt-2 h-5 w-5 opacity-40"
                />
              </div>

              <div className="mt-10 grid gap-10 border-t border-border/70 pt-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
                <section>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Résultats clés
                      </p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                        Mesures de réussite
                      </h2>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddResult((visible) => !visible)}
                      className="rounded-xl"
                    >
                      {showAddResult ? (
                        <X className="mr-2 h-4 w-4" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" weight="bold" />
                      )}
                      {showAddResult ? "Fermer" : "Ajouter un résultat"}
                    </Button>
                  </div>

                  {showAddResult && (
                    <div className="mt-5 grid gap-3 rounded-2xl bg-[#f0f1eb] p-4 dark:bg-[#1a1c18] sm:grid-cols-[1fr_110px_auto]">
                      <Input
                        value={resultToAdd.description}
                        onChange={(event) =>
                          setResultToAdd({
                            ...resultToAdd,
                            description: event.target.value,
                          })
                        }
                        placeholder="Décrire le résultat clé"
                        className="h-10 rounded-xl bg-background"
                        autoFocus
                      />
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={resultToAdd.progress}
                          onChange={(event) =>
                            setResultToAdd({
                              ...resultToAdd,
                              progress: Math.min(
                                100,
                                Math.max(0, Number(event.target.value)),
                              ),
                            })
                          }
                          className="h-10 rounded-xl bg-background pr-8 font-mono"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>
                      </div>
                      <Button
                        onClick={() => void handleAddResultToOKR(selectedOKR)}
                        className="rounded-xl"
                      >
                        Ajouter
                      </Button>
                    </div>
                  )}

                  <div className="mt-5 divide-y divide-border/70 border-y border-border/70">
                    {selectedKeyResults.map((keyResult, index) => (
                      <div key={`${selectedOKR.id}-${index}`} className="py-6">
                        <PercentageEditor
                          value={getKeyResultPercentage(keyResult)}
                          onSave={(percentage) =>
                            handleUpdateKeyResultProgress(
                              selectedOKR,
                              index,
                              percentage,
                            )
                          }
                          label={
                            <div className="flex min-w-0 items-start gap-3">
                              <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted font-mono text-[11px] text-muted-foreground">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <InlineTextEdit
                                value={keyResult.description}
                                placeholder="Décrire le résultat clé"
                                ariaLabel={`Résultat clé ${index + 1}`}
                                required
                                onSave={(description) =>
                                  handleUpdateKeyResultDescription(
                                    selectedOKR,
                                    index,
                                    description,
                                  )
                                }
                                displayClassName="py-1 text-sm font-medium leading-6"
                                iconClassName="mt-1 opacity-35"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() =>
                                  void handleRemoveKeyResult(selectedOKR, index)
                                }
                                aria-label={`Supprimer ${keyResult.description}`}
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          }
                          ariaLabel={`Progression de ${keyResult.description}`}
                          barClassName={
                            STATUS_CONFIG[selectedOKR.status].barClassName
                          }
                          controlClassName="rounded-xl"
                          progressClassName="mt-3 h-2 rounded-full"
                        />
                      </div>
                    ))}

                    {!selectedKeyResults.length && (
                      <div className="py-10 text-center">
                        <Circle className="mx-auto h-5 w-5 text-muted-foreground" />
                        <p className="mt-3 text-sm font-medium">
                          Aucun résultat clé
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ajoutez une première mesure de réussite.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                <aside className="h-fit rounded-2xl bg-[#20231e] p-6 text-[#f3f5ee] dark:bg-[#e7eadf] dark:text-[#1d201a]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#aeb5a4] dark:text-[#687061]">
                    Progression globale
                  </p>
                  <div className="mt-4 font-mono text-6xl font-semibold tracking-[-0.08em]">
                    {overallProgress}
                    <span className="ml-1 text-2xl text-[#aeb5a4] dark:text-[#687061]">
                      %
                    </span>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10 dark:bg-black/10">
                    <div
                      className="h-full origin-left rounded-full bg-[#d4dfaa] transition-transform duration-300 dark:bg-[#68764f]"
                      style={{ transform: `scaleX(${overallProgress / 100})` }}
                    />
                  </div>

                  <div className="mt-7 space-y-5 border-t border-white/10 pt-6 dark:border-black/10">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#aeb5a4] dark:text-[#687061]">
                        Statut
                      </label>
                      <Select
                        value={selectedOKR.status}
                        onValueChange={(value) =>
                          void handleUpdateOKR(selectedOKR.id, {
                            status: value as OKR["status"],
                          })
                        }
                      >
                        <SelectTrigger
                          className={`mt-2 h-10 rounded-xl ${
                            STATUS_CONFIG[selectedOKR.status].className
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on-track">Dans les temps</SelectItem>
                          <SelectItem value="at-risk">À risque</SelectItem>
                          <SelectItem value="off-track">
                            Hors trajectoire
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#aeb5a4] dark:text-[#687061]">
                        Période
                      </span>
                      <InlineTextEdit
                        value={selectedOKR.quarter}
                        placeholder="Ajouter une période"
                        ariaLabel={`Période de ${selectedOKR.objective}`}
                        onSave={(quarter) =>
                          handleUpdateOKR(selectedOKR.id, {
                            quarter: quarter || null,
                          })
                        }
                        displayClassName="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-[#f3f5ee] hover:bg-white/10 dark:border-black/10 dark:bg-black/5 dark:text-[#1d201a]"
                        inputClassName="mt-2 h-10 rounded-xl border-white/15 bg-white/10 text-[#f3f5ee] dark:border-black/15 dark:bg-black/5 dark:text-[#1d201a]"
                        iconClassName="opacity-50"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#bdc3b7] dark:text-[#596052]">
                      <span>Résultats suivis</span>
                      <span className="font-mono font-semibold">
                        {selectedKeyResults.length}
                      </span>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          ) : (
            <div className="grid min-h-[650px] place-items-center p-8 text-center">
              <div>
                <Target
                  className="mx-auto h-8 w-8 text-muted-foreground"
                  weight="duotone"
                />
                <h2 className="mt-4 text-lg font-semibold">
                  Aucun objectif sélectionné
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Créez un OKR ou modifiez les filtres pour ouvrir son détail.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <AlertDialog
        open={Boolean(okrToDelete)}
        onOpenChange={(open) => {
          if (!open) setOKRToDelete(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet OKR ?</AlertDialogTitle>
            <AlertDialogDescription>
              {okrToDelete?.objective} et ses résultats clés seront supprimés
              définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Conserver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteOKR()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
