import logo from '../assets/Propath_Primary Logo_Black.png';

/**
 * Shown at the old private-link addresses (/athlete/<token> and /wellness/<token>).
 * Those links stopped working on 28 Oct 2026 — everyone signs in with their own username and password now.
 * Anyone who lands here (an old bookmark, an old Home Screen icon, a link in an old message) is pointed at the
 * sign-in page instead of a blank or broken screen.
 */
export default function LegacyLinkNotice() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: '#fafafa' }}>
      <img src={logo} alt="ProPath" style={{ width: 120 }} className="mb-8" />
      <h1 className="text-xl font-bold mb-2" style={{ color: '#1C1C1C' }}>This link doesn’t work any more</h1>
      <p className="text-sm max-w-xs mb-6" style={{ color: '#6b7280' }}>
        ProPath now uses your own login. Open the athlete app and sign in with the username and starting password your coach sent you.
        If you can’t find them, ask your coach — or tap “Forgot your password?” on the sign-in page.
      </p>
      <a
        href="/athlete"
        className="inline-block rounded-md px-6 py-3 text-sm font-bold text-white"
        style={{ backgroundColor: '#A58D69' }}
      >
        Go to sign in
      </a>
    </div>
  );
}
