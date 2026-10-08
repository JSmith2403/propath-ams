import { useEffect, useState } from 'react';
import { CheckCircle2, Share, Smartphone, Download, ScanFace } from 'lucide-react';
import logo from '../../assets/Propath_Primary Logo_Black.png';
import { getInstallEvent, subscribeInstall } from '../../utils/installPrompt';
import { isIOSDevice } from '../../utils/pushSubscribe';

const GOLD = '#A58D69';

function Step({ n, done, title, children }) {
  return (
    <div className="rounded-xl bg-white border border-ink-100 shadow-card p-4 text-left">
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
          style={done ? { backgroundColor: '#dcfce7', color: '#166534' } : { backgroundColor: 'rgba(165,141,105,0.16)', color: '#7a6748' }}
        >
          {done ? <CheckCircle2 size={16} /> : n}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body font-semibold text-ink-900">{title}</p>
          <div className="text-meta text-ink-500 mt-1 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * First-time guide, shown once right after an athlete has chosen their own
 * password (and only in a browser tab — if they're already in the installed app
 * there's nothing to install). Walks them through the three things that make the
 * app work like any other on their phone:
 *   1. save the password (so Face ID / fingerprint fills it in next time)
 *   2. add the app to the Home Screen
 *   3. open it from the icon and turn on notifications
 * Note an installed iPhone app keeps its own sign-in, separate from Safari — so
 * they sign in once more there, which is exactly where the saved password helps.
 */
export default function AthleteOnboarding({ onDone }) {
  const ios = isIOSDevice();
  const [installEvent, setInstallEvent] = useState(() => getInstallEvent());
  useEffect(() => subscribeInstall(() => setInstallEvent(getInstallEvent())), []);
  const [installed, setInstalled] = useState(false);

  const install = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    try {
      const { outcome } = await installEvent.userChoice;
      if (outcome === 'accepted') setInstalled(true);
    } catch (_) { /* dismissed */ }
  };

  return (
    <div className="min-h-screen px-5 py-8 bg-ink-50 flex flex-col items-center">
      <img src={logo} alt="ProPath" style={{ width: '110px' }} className="mb-5" />
      <h1 className="text-h2 font-bold text-ink-900 text-center">You&rsquo;re in! Two quick things</h1>
      <p className="text-meta text-ink-500 text-center mt-1 mb-5 max-w-xs">
        So ProPath works like any other app on your phone.
      </p>

      <div className="w-full max-w-sm space-y-3">
        <Step n={1} done title="Your password is set">
          <span className="flex items-start gap-1.5">
            <ScanFace size={14} className="shrink-0 mt-0.5" />
            <span>
              If your phone asked to <strong>save the password</strong>, tap <strong>Save</strong>. Next time,
              Face ID (or your fingerprint) fills it in for you.
            </span>
          </span>
        </Step>

        <Step n={2} done={installed} title="Add ProPath to your Home Screen">
          {ios ? (
            <ol className="list-decimal pl-4 space-y-1">
              <li>Tap the <Share size={13} className="inline -mt-0.5" /> <strong>Share</strong> button in Safari.</li>
              <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong>.</li>
            </ol>
          ) : installEvent ? (
            <button
              onClick={install}
              className="mt-1.5 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-meta font-bold text-white"
              style={{ backgroundColor: GOLD }}
            >
              <Download size={14} /> Install ProPath
            </button>
          ) : (
            <span>Tap the <strong>⋮</strong> menu in your browser, then <strong>Install app</strong> (or <strong>Add to Home screen</strong>).</span>
          )}
        </Step>

        <Step n={3} title="Open it from the icon">
          <span className="flex items-start gap-1.5">
            <Smartphone size={14} className="shrink-0 mt-0.5" />
            <span>
              Open ProPath from your Home Screen and sign in once more — your saved password fills in with
              Face ID. Then tap <strong>Turn on notifications</strong> so messages and timetable updates reach you.
            </span>
          </span>
        </Step>
      </div>

      <div className="w-full max-w-sm mt-6 space-y-2">
        <button
          onClick={onDone}
          className="w-full rounded-xl py-3.5 text-body font-bold text-white"
          style={{ backgroundColor: GOLD }}
        >
          Continue
        </button>
        <button onClick={onDone} className="w-full text-meta text-ink-400 underline underline-offset-2 py-1">
          I&rsquo;ll do this later
        </button>
      </div>
    </div>
  );
}
