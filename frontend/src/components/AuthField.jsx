import { useId } from 'react'

export function AuthField({ label, type = 'text', value, onChange, autoComplete, hint, required = true, children }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[10px] font-medium tracking-[0.06em] text-ink-3 uppercase">
        {label}
      </label>
      {children ?? (
        <input
          id={id}
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-line bg-panel px-2.5 py-2 text-[13px] text-ink transition-colors duration-150 placeholder:text-ink-3 focus:border-accent focus:outline-none"
        />
      )}
      {hint && <p className="mt-1.5 text-[10.5px] text-ink-3">{hint}</p>}
    </div>
  )
}

export function AuthError({ message }) {
  if (!message) return null
  return (
    <p role="alert" className="border-l-2 border-[var(--shortage)] pl-2.5 text-[11.5px] text-[var(--shortage)]">
      {message}
    </p>
  )
}

export function AuthSubmit({ children, busy }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full bg-accent px-3 py-2 text-[12.5px] font-medium text-white transition-opacity duration-150 hover:opacity-90 focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? 'Please wait…' : children}
    </button>
  )
}
