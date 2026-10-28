import { describe, it, expect } from 'vitest';
import { buildGroups, snippetParts } from './resourceSearch';

describe('buildGroups', () => {
  it('turns "pre-game snacks" into one group per idea, each with near-synonyms', () => {
    const g = buildGroups('Pre-game snacks');
    expect(g).toHaveLength(3);
    expect(g[0].split(' ')).toEqual(expect.arrayContaining(['pre', 'before']));
    expect(g[1].split(' ')).toEqual(expect.arrayContaining(['game', 'match', 'competition', 'training']));
    expect(g[2].split(' ')).toEqual(expect.arrayContaining(['snacks', 'snack', 'fuel', 'food']));
  });

  it('drops filler words and duplicates', () => {
    expect(buildGroups('what should I eat for the game game')).toHaveLength(3);   // should, eat, game  ("what/I/for/the" dropped)
    expect(buildGroups('   ')).toEqual([]);
    expect(buildGroups('the of a')).toEqual([]);
  });

  it('keeps unknown words as their own idea', () => {
    expect(buildGroups('creatine')).toEqual(['creatine']);
  });

  it('is safe with punctuation', () => {
    expect(buildGroups("sleep!! & recovery?")).toHaveLength(2);
    expect(() => buildGroups(null)).not.toThrow();
  });
});

describe('snippetParts', () => {
  it('splits the database markers into plain text and highlighted words', () => {
    expect(snippetParts('Eat <<pre>>-<<game>> <<snacks>> early')).toEqual([
      { text: 'Eat ', hit: false }, { text: 'pre', hit: true }, { text: '-', hit: false },
      { text: 'game', hit: true }, { text: ' ', hit: false }, { text: 'snacks', hit: true }, { text: ' early', hit: false },
    ]);
  });
  it('never treats the text as HTML', () => {
    expect(snippetParts('<script>x</script> <<hit>>').map(p => p.text).join('')).toContain('<script>');
  });
  it('handles empty input', () => { expect(snippetParts(null)).toEqual([]); });
});
