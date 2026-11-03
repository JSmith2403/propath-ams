import { describe, it, expect, beforeEach } from 'vitest';
import { createHash } from 'node:crypto';
import { makePkce, newState, authorizeUrl, redirectUri } from './oauth.js';

beforeEach(() => { process.env.GARMIN_CLIENT_ID = 'client-123'; delete process.env.GARMIN_REDIRECT_URI; });

describe('PKCE', () => {
  it('makes a 43–128 character verifier from the allowed characters, and challenge = base64url(sha256(verifier))', () => {
    const { verifier, challenge } = makePkce();
    expect(verifier).toMatch(/^[A-Za-z0-9\-._~]{43,128}$/);
    const expected = createHash('sha256').update(verifier).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(challenge).toBe(expected);
  });
  it('is different every time', () => {
    expect(makePkce().verifier).not.toBe(makePkce().verifier);
    expect(newState()).not.toBe(newState());
  });
});

describe('authorizeUrl', () => {
  it('points at Garmin with every required parameter and our redirect address', () => {
    const u = new URL(authorizeUrl({ state: 'st', challenge: 'ch' }));
    expect(u.origin + u.pathname).toBe('https://connect.garmin.com/oauth2Confirm');
    expect(Object.fromEntries(u.searchParams)).toEqual({
      response_type: 'code', client_id: 'client-123', code_challenge: 'ch', code_challenge_method: 'S256',
      redirect_uri: 'https://propath-ams.vercel.app/api/garmin/callback', state: 'st',
    });
  });
  it('the redirect address matches what is registered on the Garmin app', () => {
    expect(redirectUri()).toBe('https://propath-ams.vercel.app/api/garmin/callback');
  });
});
