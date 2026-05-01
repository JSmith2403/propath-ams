/**
 * Coaching insights generated from a wellness average. Whoop-style:
 * one short insight per metric, tuned to the current trend.
 *
 * Insights are static rules — no LLM, no surprises — so coaches can
 * audit what athletes see.
 */

const RULES = {
  sleep_duration: [
    { pred: (a) => a < 6,             tone: 'red',
      title: 'Sleep is short',
      body:  'Average under 6 hours over this window. Aim for 7-9 hrs — sleep is the single biggest lever for recovery.' },
    { pred: (a) => a < 7,             tone: 'amber',
      title: 'Just under target',
      body:  'You are averaging under 7 hours. An extra 30-60 minutes a night would meaningfully improve adaptation.' },
    { pred: () => true,               tone: 'green',
      title: 'Solid sleep volume',
      body:  'Hitting 7+ hours on average. Consistency now matters as much as quantity — same bed and wake time daily.' },
  ],
  sleep_quality: [
    { pred: (a) => a > 5,             tone: 'red',
      title: 'Quality is poor',
      body:  'Cool, dark, quiet bedroom. No caffeine after 2pm. No screens 30 mins before bed — small changes stack.' },
    { pred: (a) => a > 3,             tone: 'amber',
      title: 'Quality is mid',
      body:  'Try a 30-minute wind-down routine — dim lights, no phone, light reading. Quality often improves faster than duration.' },
    { pred: () => true,               tone: 'green',
      title: 'Quality is good',
      body:  'Whatever you are doing — keep the routine. Sleep quality is highly trainable, do not lose the habit.' },
  ],
  fatigue: [
    { pred: (a) => a > 5,             tone: 'red',
      title: 'High fatigue',
      body:  'Flag this with your coach. Under-fueling, under-sleeping or accumulated training stress are the usual causes.' },
    { pred: (a) => a > 3,             tone: 'amber',
      title: 'Fatigue creeping in',
      body:  'Watch fueling around training and prioritise sleep. Light aerobic work can help on heavy fatigue days.' },
    { pred: () => true,               tone: 'green',
      title: 'Energy is good',
      body:  'You are recovering well between sessions. Keep the habits that got you here.' },
  ],
  muscle_soreness: [
    { pred: (a) => a > 5,             tone: 'red',
      title: 'High soreness',
      body:  'Light movement beats stillness — easy walk or bike, mobility, hydration. Tell your coach if it lingers > 72 hrs.' },
    { pred: (a) => a > 3,             tone: 'amber',
      title: 'Moderate soreness',
      body:  'Normal for a hard training week. Foam roll, stretch, sleep — and trust the process.' },
    { pred: () => true,               tone: 'green',
      title: 'Body feels fresh',
      body:  'Low soreness is a green light to push intensity. Make the most of it.' },
  ],
  stress: [
    { pred: (a) => a > 5,             tone: 'red',
      title: 'Stress is high',
      body:  'Box breathing (4-4-4-4) for 5 minutes, twice a day. Talk to a coach or someone you trust if it persists.' },
    { pred: (a) => a > 3,             tone: 'amber',
      title: 'Some stress present',
      body:  'Brief mindfulness or a walk outside without your phone goes a long way. Watch caffeine.' },
    { pred: () => true,               tone: 'green',
      title: 'Stress is in check',
      body:  'You are managing pressure well. Note what is working so you can return to it under load.' },
  ],
};

export function getInsight(metric, average) {
  const rules = RULES[metric] || [];
  const match = rules.find(r => r.pred(average));
  return match || null;
}

export const INSIGHT_TONE_COLOURS = {
  green: '#22c55e',
  amber: '#f59e0b',
  red:   '#ef4444',
};
