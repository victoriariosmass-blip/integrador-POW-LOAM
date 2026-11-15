export default function Button({ children, variant = 'primary', type = 'button', loading = false, disabled = false, className = '', ...props }) {
  const clase = variant === 'secondary' ? 'btn-outline-primary' : variant === 'danger' ? 'btn-outline-danger' : 'btn-primary';
  // mientras carga queda desactivado aunque venga disabled={false} (evita mandar dos veces)
  return (
    <button type={type} className={`btn ${clase} ${className}`} {...props} disabled={loading || disabled}>
      {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
      {children}
    </button>
  );
}