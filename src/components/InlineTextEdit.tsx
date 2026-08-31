import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { CircleNotch, PencilSimple } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface InlineTextEditProps {
  value?: string | null;
  placeholder: string;
  ariaLabel: string;
  onSave: (value: string) => Promise<boolean>;
  multiline?: boolean;
  required?: boolean;
  displayClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
}

export function InlineTextEdit({
  value,
  placeholder,
  ariaLabel,
  onSave,
  multiline = false,
  required = false,
  displayClassName,
  inputClassName,
  iconClassName,
}: InlineTextEditProps) {
  const currentValue = value ?? "";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savingRef = useRef(false);
  const cancelBlurRef = useRef(false);

  useEffect(() => {
    if (!editing) {
      setDraft(currentValue);
    }
  }, [currentValue, editing]);

  const cancel = () => {
    cancelBlurRef.current = true;
    setDraft(currentValue);
    setError(null);
  };

  const commit = async () => {
    if (cancelBlurRef.current) {
      cancelBlurRef.current = false;
      setEditing(false);
      return;
    }
    if (savingRef.current) return;

    const nextValue = draft.trim();
    if (required && !nextValue) {
      setError("Ce champ ne peut pas être vide.");
      return;
    }
    if (nextValue === currentValue.trim()) {
      setEditing(false);
      setError(null);
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError(null);
    const saved = await onSave(nextValue);
    savingRef.current = false;
    setSaving(false);

    if (saved) {
      setEditing(false);
      return;
    }

    setError("La modification n’a pas pu être enregistrée.");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
      event.currentTarget.blur();
      return;
    }

    const shouldCommit = multiline
      ? event.key === "Enter" && (event.metaKey || event.ctrlKey)
      : event.key === "Enter";

    if (shouldCommit) {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  if (editing) {
    return (
      <div className="relative" onClick={(event) => event.stopPropagation()}>
        {multiline ? (
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => void commit()}
            onKeyDown={handleKeyDown}
            aria-label={ariaLabel}
            className={cn("min-h-20 resize-none pr-9 text-sm", inputClassName)}
            disabled={saving}
            autoFocus
          />
        ) : (
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => void commit()}
            onKeyDown={handleKeyDown}
            aria-label={ariaLabel}
            className={cn("h-9 pr-9", inputClassName)}
            disabled={saving}
            autoFocus
          />
        )}
        {saving && (
          <CircleNotch className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {error && (
          <p className="mt-1.5 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        setDraft(currentValue);
        setEditing(true);
      }}
      className={cn(
        "group/edit flex w-full items-start gap-2 rounded-md text-left outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        !currentValue && "text-muted-foreground",
        displayClassName,
      )}
      aria-label={`${ariaLabel}. Cliquer pour modifier`}
    >
      <span className="min-w-0 flex-1 whitespace-pre-wrap">{currentValue || placeholder}</span>
      <PencilSimple
        className={cn(
          "mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover/edit:opacity-60 group-focus-visible/edit:opacity-60",
          iconClassName,
        )}
      />
    </button>
  );
}
