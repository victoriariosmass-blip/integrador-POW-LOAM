import AppShell from '../ui/templates/AppShell';
import { UsuarioProvider } from '../lib/UsuarioContext';
 
export default function AppLayout({ children }) {
  return (
    <UsuarioProvider>
      <AppShell>{children}</AppShell>
    </UsuarioProvider>
  );
}
 