import { useId } from 'react';
import Input from '../atoms/Input';

export default function Field({ label, error, hint, required = false, id, ...inputProps }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const msgId = `${inputId}-msg`;
  return (
    <div className="mb-3">
      <label htmlFor={inputId} className="form-label fw-semibold">
        {label}{required && <span className="text-danger"> *</span>}
      </label>
      <Input id={inputId} required={required} invalid={!!error} aria-describedby={error || hint ? msgId : undefined} {...inputProps} />
      {error && <div id={msgId} className="invalid-feedback">{error}</div>}
      {!error && hint && <div id={msgId} className="form-text">{hint}</div>}
    </div>
  );
}