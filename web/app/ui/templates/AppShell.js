import Sidebar from '../organisms/Sidebar';
import Topbar from '../organisms/Topbar';
import AvisoConexion from '../organisms/AvisoConexion';


export default function AppShell({ children }) {
  return (
    <div className="d-flex flex-column vh-100">
      {/* primer elemento al tabular: evita pasar por el buscador y todo el menú en cada página */}
      <a href="#contenido" className="visually-hidden-focusable saltar-contenido">Saltar al contenido</a>
      <Topbar />
      <div className="d-flex flex-grow-1 overflow-hidden">
        <aside className="d-none d-md-block app-sidebar" style={{ width: 260 }}>
          <Sidebar />
        </aside>
        
        <div className="offcanvas offcanvas-start app-sidebar" tabIndex="-1" id="menuMovil" aria-labelledby="menuMovilTitulo">
          <div className="offcanvas-header">
            <h2 className="offcanvas-title h5" id="menuMovilTitulo">Menú</h2>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar" />
          </div>
          <div className="offcanvas-body p-0"><Sidebar enMenuMovil /></div>
        </div>

        <main id="contenido" tabIndex={-1} className="flex-grow-1 overflow-auto p-3 p-sm-4">
          <AvisoConexion />
          {children}
        </main>
      </div>
    </div>
  );
}