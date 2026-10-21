export default function Input({ invalid = false, className = '', ...props }) {
  return <input className={`form-control ${invalid ? 'is-invalid' : ''} ${className}`} aria-invalid={invalid || undefined} {...props} />;
}