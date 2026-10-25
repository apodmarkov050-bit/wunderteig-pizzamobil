import { redirect } from 'next/navigation';
import { getAdminUser } from '../../../lib/adminAuth';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({ searchParams }) {
  if (await getAdminUser()) redirect('/admin');
  const params = await searchParams;
  const setupMissing = !process.env.ADMIN_EMAILS?.trim();

  return (
    <main className="adminLoginPage">
      <form className="adminLoginCard" action="/api/admin/login" method="post">
        <a className="statsBackLink" href="/">← OrderPilot</a>
        <h1>Admin-Anmeldung</h1>
        <p className="adminLoginIntro">Melde dich an, um Bestellungen und Statistiken zu verwalten.</p>

        {setupMissing ? (
          <p className="adminLoginError" role="alert">
            Der Administratorzugang ist noch nicht eingerichtet. Bitte ADMIN_EMAILS konfigurieren.
          </p>
        ) : null}
        {params?.error ? (
          <p className="adminLoginError" role="alert">
            Anmeldung fehlgeschlagen. Prüfe E-Mail-Adresse und Passwort.
          </p>
        ) : null}

        <label className="adminLoginLabel">
          E-Mail
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label className="adminLoginLabel">
          Passwort
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="adminLoginButton" type="submit" disabled={setupMissing}>
          Anmelden
        </button>
      </form>
    </main>
  );
}
