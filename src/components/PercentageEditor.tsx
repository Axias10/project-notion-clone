import { ReactNode, useEffect, useRef, useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PercentageEditorProps {
  value: number;
  onSave: (value: number) => Promise<boolean>;
  label: ReactNode;
  ariaLabel: string;
  barClassName?: string;
  className?: string;
  controlClassName?: string;
  inputClassName?: string;
  progressClassName?: string;
}

const clampPercentage = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

export function PercentageEditor({
  value,
  onSave,
  label,
  ariaLabel,
  barClassName,
  className,
  controlClassName,
  inputClassName,
  progressClassName,
}: PercentageEditorProps) {
  const normalizedValue = clampPercentage(value);
  const [draft, setDraft] = useState(String(normalizedValue));
  const [saving, setSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const savingRef = useRef(false);
  const cancelBlurRef = useRef(false);

  useEffect(() => {
    if (!savingRef.current) {
      setDraft(String(normalizedValue));
    }
  }, [normalizedValue]);

  const parsedDraft = Number(draft);
  const previewValue = Number.isFinite(parsedDraft)
    ? clampPercentage(parsedDraft)
    : normalizedValue;

  const commit = async () => {
    if (cancelBlurRef.current) {
      cancelBlurRef.current = false;
      return;
    }
    if (savingRef.current) return;

    if (!draft.trim() || !Number.isFinite(parsedDraft)) {
      setDraft(String(normalizedValue));
      return;
    }

    const nextValue = clampPercentage(parsedDraft);
    setDraft(String(nextValue));

    if (nextValue === normalizedValue) {
      setHasError(false);
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setHasError(false);
    const saved = await onSave(nextValue);
    savingRef.current = false;
    setSaving(false);

    if (!saved) {
      setDraft(String(normalizedValue));
      setHasError(true);
    }
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0 flex-1">{label}</div>
        <div
          className={cn(
            "flex h-9 shrink-0 items-center rounded-lg border bg-background pl-2.5 pr-2 text-sm transition-colors focus-within:border-foreground/40 focus-within:ring-2 focus-within:ring-ring/20",
            hasError && "border-destructive",
            controlClassName,
          )}
        >
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            inputMode="numeric"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setHasError(false);
            }}
            onBlur={() => void commit()}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
              if (event.key === "Escape") {
                cancelBlurRef.current = true;
                setDraft(String(normalizedValue));
                event.currentTarget.blur();
              }
            }}
            className={cn(
              "w-10 bg-transparent text-right font-mono font-semibold tabular-nums outline-none",
              inputClassName,
            )}
            aria-label={ariaLabel}
            disabled={saving}
          />
          <span className="ml-0.5 text-xs font-medium text-muted-foreground">%</span>
          {saving && <CircleNotch className="ml-1.5 h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
      </div>
      <Progress
        value={previewValue}
        className={cn(
          "h-1.5 rounded-none bg-muted [&>div]:transition-transform [&>div]:duration-300",
          barClassName,
          progressClassName,
        )}
      />
      {hasError && (
        <span className="sr-only" role="alert">
          La progression n’a pas pu être enregistrée.
        </span>
      )}
    </div>
  );
}
