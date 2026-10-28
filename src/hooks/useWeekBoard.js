import { useSyncExternalStore } from 'react';

/**
 * The week "board" — copied weeks waiting to be pasted. Held at module level (not in a component) so it
 * survives moving between months and between athletes' profiles: copy Maggie's four weeks, open Yassin, paste.
 * It lives only in memory; a page refresh clears it.
 */
let board = null;
const listeners = new Set();

export const getWeekBoard = () => board;
export function setWeekBoard(next) {
  board = next;
  listeners.forEach(fn => fn());
}
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export function useWeekBoard() {
  return useSyncExternalStore(subscribe, getWeekBoard);
}
