// One labelled text field with its hint and error line (used by the profile, sign-in and sign-up forms).

export default function Field({
  id,
  label,
  value,
  error,
  hint,
  optional,
  type = "text",
  inputMode,
  maxLength,
  autoComplete,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  type?: string;
  inputMode?: "numeric" | "text";
  maxLength?: number;
  autoComplete?: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
}) {
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ");
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`mt-1 w-full rounded-field border bg-page px-3 py-2.5 text-sm text-ink placeholder:text-muted ${
          error ? "border-brand-red-dark" : "border-line"
        }`}
      />
      {hint && (
        <p id={`${id}-hint`} className="pt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {/* always on the page (with a minimum height) so an error never makes the form jump */}
      <p id={`${id}-error`} className="min-h-5 pt-1 text-xs font-semibold text-redtext">
        {error}
      </p>
    </div>
  );
}
