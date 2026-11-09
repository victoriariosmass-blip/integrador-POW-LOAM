import { redirect } from 'next/navigation';

// La portada del sitio es la vista pública; el sistema está en /login
export default function Home() {
  redirect('/publico');
}