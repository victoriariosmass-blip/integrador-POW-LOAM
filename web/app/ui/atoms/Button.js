export default function Button({ children, variant = 'primary', type = 'button', loading = false, className = '', ...props }) {
  const clase = variant === 'secondary' ? 'btn-outline-primary' : variant === 'danger' ? 'btn-outline-danger' : 'btn-primary';
  return (
    <button type={type} className={`btn ${clase} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
      {children}
    </button>
  );
}