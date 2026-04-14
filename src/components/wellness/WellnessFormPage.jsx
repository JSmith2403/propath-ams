import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import logo from '../../assets/Propath_Primary Logo_White.png';
import WellnessSlider from './WellnessSlider';

function todayLocal() {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local tz
}

function minDateLocal() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toLocaleDateString('en-CA');
}

const INITIAL = {
  sleep_duration: 7,
  sleep_quality: 4,
  fatigue: 4,
  muscle_soreness: 4,
  stress: 4,
};

export default function WellnessFormPage() {
  const { token } = useParams();

  const [status, setStatus] = useState('loading'); // loading | invalid | ready | submitted
  const [athleteName, setAthleteName] = useState('');
  const [athleteId, setAthleteId] = useState('');
  const [date, setDate] = useState(todayLocal());
  const [form, setForm] = useState(INITIAL);
  const [editingId, setEditingId] = useState(null); // uuid of existing submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Validate token and load athlete name
  useEffect(() => {
    (async () => {
      const { data: tokenRow } = await supabase
        .from('wellness_tokens')
        .select('athlete_id, is_active')
        .eq('token', token)
        .single();

      if (!tokenRow || !tokenRow.is_active) {
        setStatus('invalid');
        return;
      }

      setAthleteId(tokenRow.athlete_id);

      // Fetch athlete name from athletes table
      const { data: athleteRow } = await supabase
        .from('athletes')
        .select('data')
        .eq('id', tokenRow.athlete_id)
        .single();

      const name = athleteRow?.data?.name || 'Athlete';
      setAthleteName(name);
      setStatus('ready');
    })();
  }, [token]);

  // Check for existing submission when date changes
  const checkExisting = useCallback(async () => {
    if (!athleteId || !date) return;
    const { data } = await supabase
      .from('wellness_submissions')
      .select('*')
      .eq('athlete_id', athleteId)
      .eq('submission_date', date)
      .single();

    if (data) {
      setEditingId(data.id);
      setForm({
        sleep_duration: data.sleep_duration,
        sleep_quality: data.sleep_quality,
        fatigue: data.fatigue,
        muscle_soreness: data.muscle_soreness,
        stress: data.stress,
      });
    } else {
      setEditingId(null);
      setForm(INITIAL);
    }
  }, [athleteId, date]);

  useEffect(() => {
    if (status === 'ready') checkExisting();
  }, [status, date, checkExisting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      athlete_id: athleteId,
      token,
      submission_date: date,
      ...form,
    };

    let result;
    if (editingId) {
      result = await supabase
        .from('wellness_submissions')
        .update(payload)
        .eq('id', editingId);
    } else {
      result = await supabase
        .from('wellness_submissions')
        .insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSubmitting(false);
      return;
    }

    setStatus('submitted');
    setSubmitting(false);
  };

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  // ── Invalid token ──────────────────────────────────────────────────────────
  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#1C1C1C' }}>
        <img src={logo} alt="ProPath" style={{ width: '160px' }} className="mb-8" />
        <p className="text-center text-sm" style={{ color: '#999' }}>
          This wellness link is not active. Please contact your coach.
        </p>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1C1C1C' }}>
        <div
          className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: 'rgba(165,141,105,0.25)', borderTopColor: '#A58D69' }}
        />
      </div>
    );
  }

  // ── Submitted ──────────────────────────────────────────────────────────────
  if (status === 'submitted') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#1C1C1C' }}>
        <img src={logo} alt="ProPath" style={{ width: '160px' }} className="mb-8" />
        <div className="rounded-xl p-6 max-w-md w-full text-center" style={{ backgroundColor: '#262626' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(165,141,105,0.15)' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" stroke="#A58D69" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#e5e5e5' }}>Questionnaire complete</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#999' }}>
            Please remember to alert your coach to anything you think they should be aware of. This does not remove the need to inform them directly.
          </p>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1C1C1C' }}>
      {/* Header */}
      <div className="flex flex-col items-center pt-8 pb-4 px-4">
        <img src={logo} alt="ProPath" style={{ width: '140px' }} className="mb-6" />
        <h1 className="text-lg font-semibold" style={{ color: '#A58D69' }}>{athleteName}</h1>
        <p className="text-xs mt-1" style={{ color: '#666' }}>Daily Wellness Check-in</p>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto rounded-xl p-6 mb-8 mx-4 sm:mx-auto"
        style={{ backgroundColor: '#262626' }}
      >
        {/* Date picker */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2" style={{ color: '#e5e5e5' }}>Date</label>
          <input
            type="date"
            value={date}
            min={minDateLocal()}
            max={todayLocal()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: '#333',
              color: '#e5e5e5',
              border: '1px solid #444',
            }}
          />
          {editingId && (
            <p className="text-xs mt-2 px-1" style={{ color: '#A58D69' }}>
              You have already submitted for this date. Your previous answers are shown below and can be updated.
            </p>
          )}
        </div>

        {/* Sleep Duration — number input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2" style={{ color: '#e5e5e5' }}>
            How many hours did you sleep last night?
          </label>
          <input
            type="number"
            min={0}
            max={12}
            step={0.5}
            value={form.sleep_duration}
            onChange={(e) => set('sleep_duration')(Number(e.target.value))}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: '#333',
              color: '#e5e5e5',
              border: '1px solid #444',
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: '#888' }}>0 hours</span>
            <span className="text-xs" style={{ color: '#888' }}>12 hours</span>
          </div>
        </div>

        {/* Sleep Quality */}
        <WellnessSlider
          label="How would you rate your sleep quality?"
          value={form.sleep_quality}
          onChange={set('sleep_quality')}
          leftAnchor="Very, very good"
          rightAnchor="Very, very poor"
        />

        {/* Fatigue */}
        <WellnessSlider
          label="How fatigued do you feel today?"
          value={form.fatigue}
          onChange={set('fatigue')}
          leftAnchor="Very, very low"
          rightAnchor="Very, very high"
        />

        {/* Muscle Soreness */}
        <WellnessSlider
          label="How would you rate your muscle soreness?"
          value={form.muscle_soreness}
          onChange={set('muscle_soreness')}
          leftAnchor="Very, very low"
          rightAnchor="Very, very high"
        />

        {/* Stress */}
        <WellnessSlider
          label="How stressed do you feel?"
          value={form.stress}
          onChange={set('stress')}
          leftAnchor="Very, very low"
          rightAnchor="Very, very high"
        />

        {/* Error */}
        {error && (
          <p className="text-xs mb-4 px-1" style={{ color: '#ef4444' }}>{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg py-3 text-sm font-semibold transition-opacity"
          style={{
            backgroundColor: '#A58D69',
            color: '#1C1C1C',
            opacity: submitting ? 0.5 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Submitting...' : editingId ? 'Update' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
