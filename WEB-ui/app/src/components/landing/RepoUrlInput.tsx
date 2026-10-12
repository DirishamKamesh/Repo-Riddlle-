import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { Search, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import {
  validateGithubUrl,
  type ValidationResult,
} from '../../lib/github-url-validator';

interface RepoUrlInputProps {
  onSubmit: (url: string, owner: string, repo: string) => void;
  isSubmitting?: boolean;
}

export function RepoUrlInput({ onSubmit, isSubmitting = false }: RepoUrlInputProps) {
  const [url, setUrl] = useState('');
  const [validation, setValidation] = useState<ValidationResult>({ valid: false });
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback((value: string) => {
    setUrl(value);
    if (value.trim()) {
      setValidation(validateGithubUrl(value));
    } else {
      setValidation({ valid: false });
      setTouched(false);
    }
  }, []);

  const handleBlur = useCallback(() => {
    if (url.trim()) {
      setTouched(true);
    }
  }, [url]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setTouched(true);
      if (validation.valid && validation.owner && validation.repo) {
        onSubmit(url, validation.owner, validation.repo);
      }
    },
    [url, validation, onSubmit],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setTouched(true);
        if (validation.valid && validation.owner && validation.repo) {
          onSubmit(url, validation.owner, validation.repo);
        }
      }
    },
    [url, validation, onSubmit],
  );

  const showError = touched && url.trim() !== '' && !validation.valid;
  const showSuccess = validation.valid;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2">
      {/* Input container */}
      <div
        className={`
          relative flex items-center gap-2
          bg-surface-primary rounded-lg
          border transition-colors
          ${showError ? 'border-accent-error' : showSuccess ? 'border-accent-emerald/50' : 'border-border hover:border-text-muted'}
          focus-within:border-accent-blue focus-within:ring-1 focus-within:ring-accent-blue/20
          px-4 py-3
        `}
      >
        <Search
          size={18}
          className={`flex-shrink-0 ${showError ? 'text-accent-error' : 'text-text-muted'}`}
        />

        <input
          type="url"
          value={url}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="https://github.com/owner/repository"
          className="flex-1 bg-transparent outline-none text-body-lg text-text-primary placeholder:text-text-muted font-mono"
          aria-label="GitHub repository URL"
          aria-invalid={showError}
          aria-describedby={showError ? 'url-error' : undefined}
          autoComplete="url"
          spellCheck={false}
          disabled={isSubmitting}
        />

        {/* Valid indicator */}
        {showSuccess && (
          <div className="flex-shrink-0 text-label-code font-mono text-accent-emerald flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />
            <span className="hidden sm:inline">
              {validation.owner}/{validation.repo}
            </span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!validation.valid || isSubmitting}
          className={`
            flex-shrink-0 flex items-center gap-2
            px-5 py-2 rounded-md
            font-semibold text-body-md
            transition-all active:scale-[0.98]
            ${
              validation.valid && !isSubmitting
                ? 'bg-accent-blue hover:bg-accent-blue-hover text-canvas shadow-sm cursor-pointer'
                : 'bg-ds-surface-container-high text-text-muted cursor-not-allowed'
            }
          `}
          aria-label="Investigate repository"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ArrowRight size={16} />
          )}
          <span className="hidden sm:inline">Investigate</span>
        </button>
      </div>

      {/* Error message */}
      {showError && validation.error && (
        <div
          id="url-error"
          className="flex items-center gap-1.5 text-body-sm text-accent-error px-1"
          role="alert"
        >
          <AlertCircle size={14} />
          <span>{validation.error}</span>
        </div>
      )}

      {/* Helper text */}
      {!showError && !showSuccess && (
        <p className="text-body-sm text-text-muted px-1">
          Public JavaScript and TypeScript repositories supported.
        </p>
      )}
    </form>
  );
}
