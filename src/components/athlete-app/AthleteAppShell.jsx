import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import logo from '../../assets/Propath_Primary Logo_Black.png';
import TabBar from './TabBar';
import TrainingTab from './TrainingTab';
import InstallPrompt from '../InstallPrompt';
import WellnessCheckInGate from './WellnessCheckInGate';
import TimetableGate from './TimetableGate';
import NotificationPrompt from './NotificationPrompt';
import InboxSheet from './InboxSheet';
import { MessageCircle } from 'lucide-react';
import { setAppBadgeCount } from '../../utils/appBadge';
import { useAthleteMessages } from '../../hooks/useAthleteMessages';
import { useChatRooms } from '../../hooks/useChatRooms';

const ProgressTab  = lazy(() => import('./ProgressTab'));
const NutritionTab = lazy(() => import('./NutritionTab'));

function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className="w-8 h-8 rounded-full border-4 animate-spin"
        style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }}
      />
    </div>
  );
}

const VALID_TABS = new Set(['train', 'progress', 'nutrition']);

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * AthleteAppShell — the actual app UI (header, tabs, install/notification
 * prompts), independent of how `athlete` was resolved. Shared by both
 * entry points:
 *   - AthleteAppPage    (/athlete/:token — the original, unchanged path)
 *   - AthleteStableEntry (/athlete — PIN-login athletes, Phase 1 beta)
 *
 * `athlete` shape: { id, name, photo, sport, wellnessToken, progressMetrics }
 */
export default function AthleteAppShell({ athlete }) {
  const [searchParams] = useSearchParams();
  const [activeTab, setActive] = useState(() => {
    const requested = searchParams.get('tab');
    return VALID_TABS.has(requested) ? requested : 'train';
  });
  const [scrollToResourcesNonce, setScrollToResourcesNonce] = useState(0);
  const { messages, loading: messagesLoading, unreadCount: teamUnread, markRead, sendReply, refresh: refreshMessages } = useAthleteMessages(athlete.id);
  // Group & private chats the athlete has been added to.
  const chatMe = useMemo(() => ({ type: 'athlete', athleteId: athlete.id }), [athlete.id]);
  const chat = useChatRooms(chatMe);
  const unreadCount = teamUnread + chat.totalUnread;
  // ?inbox=1 is what a message push notification opens.
  const [inboxOpen, setInboxOpen] = useState(() => searchParams.get('inbox') === '1');
  const initialRoomId = searchParams.get('room');

  // Unread count on the app icon itself, not just inside the app.
  useEffect(() => { setAppBadgeCount(unreadCount); }, [unreadCount]);

  const handleTabChange = (id) => {
    if (id === 'messages') { setInboxOpen(true); return; }
    if (id === 'resources') {
      if (activeTab !== 'train') setActive('train');
      setScrollToResourcesNonce(n => n + 1);
      return;
    }
    setActive(id);
  };

  // Blocking pop-ups run one at a time, in priority order: the daily
  // wellness check-in first, then (Sunday from 3pm, UAE) the weekly
  // timetable. Each gate only renders its children once it's clear.
  return (
    <WellnessCheckInGate athleteId={athlete.id} wellnessToken={athlete.wellnessToken}>
    <TimetableGate athleteId={athlete.id}>
    <div className="min-h-screen w-full bg-ink-100">
      <div className="min-h-screen flex flex-col mx-auto relative bg-ink-50 shadow-card"
        style={{ maxWidth: 480 }}>
        <header
          className="sticky top-0 z-20 px-4 py-2.5 flex items-center gap-3 bg-white border-b border-ink-100"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 ring-1 ring-ink-200 bg-ink-100">
            {athlete.photo
              ? <img src={athlete.photo} alt={athlete.name} className="w-full h-full object-cover" />
              : (
                <span className="text-[10px] font-bold text-ink-600">
                  {athlete.name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}
                </span>
              )}
          </div>
          <p className="flex-1 text-meta text-ink-500">{greeting()}</p>
          <button
            onClick={() => setInboxOpen(true)}
            className="relative p-1.5 rounded-full hover:bg-ink-50"
            aria-label={unreadCount ? `Messages, ${unreadCount} unread` : 'Messages'}
          >
            <MessageCircle size={18} className="text-ink-600" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                style={{ backgroundColor: '#dc2626' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <img src={logo} alt="ProPath" style={{ height: '20px' }} />
        </header>

        {/* Unmissable "you have messages" strip — tap to open the inbox. */}
        {unreadCount > 0 && !inboxOpen && (
          <button
            onClick={() => setInboxOpen(true)}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-meta font-semibold text-white"
            style={{ backgroundColor: '#dc2626' }}
          >
            <MessageCircle size={16} className="shrink-0" />
            <span className="flex-1">
              {unreadCount === 1 ? '1 new message' : `${unreadCount} new messages`} — tap to read
            </span>
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-white text-[11px] font-bold flex items-center justify-center" style={{ color: '#dc2626' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </button>
        )}

        <main className="flex-1 overflow-y-auto pb-24">
          {activeTab === 'train' && (
            <TrainingTab
              athleteId={athlete.id}
              athleteName={athlete.name}
              scrollToResourcesNonce={scrollToResourcesNonce}
              onOpenNutrition={() => setActive('nutrition')}
            />
          )}
          <Suspense fallback={<Loading />}>
            {activeTab === 'progress'  && (
              <ProgressTab athleteId={athlete.id} progressMetrics={athlete.progressMetrics} />
            )}
            {activeTab === 'nutrition' && <NutritionTab athleteId={athlete.id} />}
          </Suspense>
        </main>

        <TabBar active={activeTab} onChange={handleTabChange} badges={{ messages: unreadCount }} />
      </div>
      {inboxOpen && (
        <InboxSheet
          messages={messages}
          loading={messagesLoading}
          markRead={markRead}
          sendReply={sendReply}
          refresh={refreshMessages}
          chat={chat}
          athleteId={athlete.id}
          initialRoomId={initialRoomId}
          onClose={() => setInboxOpen(false)}
        />
      )}
      <InstallPrompt />
      <NotificationPrompt athleteId={athlete.id} />
    </div>
    </TimetableGate>
    </WellnessCheckInGate>
  );
}

export { Loading };
