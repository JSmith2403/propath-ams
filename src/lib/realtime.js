/**
 * A live-update channel name that is unique to each subscription.
 *
 * Supabase hands back the SAME channel object when two subscriptions use one name — and once it has subscribed,
 * adding a listener throws "cannot add postgres_changes callbacks … after subscribe()", which blanks the whole app.
 * That happens whenever two screens use the same hook at once (or React remounts one before the old channel has
 * finished closing). A random suffix per subscription means they never collide.
 */
export const uniqueChannelName = (base) => `${base}:${Math.random().toString(36).slice(2, 10)}`;
