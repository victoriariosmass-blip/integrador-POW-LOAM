import Sidebar from '../organisms/Sidebar';
import Topbar from '../organisms/Topbar';

export default function AppShell({ children }) {
  return (
    <div className="d-flex flex-column vh-100">
      <Topbar />
      <div className="d-flex flex-grow-1 overflow-hidden">
        <aside className="d-none d-md-block border-end bg-light" style={{ width: 260 }}>
          <Sidebar />
        </aside>

        <div className="offcanvas offcanvas-start" tabIndex="-1" id="menuMovil" aria-labelledby="menuMovilTitulo">
          <div className="offcanvas-header">
            <h2 className="offcanvas-title h5" id="menuMovilTitulo">Menú</h2>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar" />
          </div>
          <div className="offcanvas-body p-0"><Sidebar /></div>
        </div>

        <main className="flex-grow-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}