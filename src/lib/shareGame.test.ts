import { describe, expect, it, vi } from 'vitest';
import { shareGame } from './shareGame';
const url = 'https://example.com/PG-Arcade/#/jogar/xadrez';
describe('public game sharing', () => {
  it('uses the native sheet without copying or claiming a recipient joined', async () => {
    const share = vi.fn().mockResolvedValue(undefined), writeText = vi.fn();
    expect(await shareGame('Xadrez', url, {share, clipboard: {writeText}})).toBe('shared');
    expect(share).toHaveBeenCalledWith({title:'Xadrez', url});
    expect(writeText).not.toHaveBeenCalled();
  });
  it('respects cancellation without changing the clipboard', async () => {
    const writeText = vi.fn();
    expect(await shareGame('Xadrez', url, {share:vi.fn().mockRejectedValue(new DOMException('cancelled','AbortError')), clipboard:{writeText}})).toBe('cancelled');
    expect(writeText).not.toHaveBeenCalled();
  });
  it('does not copy when a cross-realm share sheet reports AbortError', async () => {
    const writeText = vi.fn();
    const share = vi.fn().mockRejectedValue({ name: 'AbortError', message: 'dismissed' });
    expect(await shareGame('Xadrez', url, { share, clipboard: { writeText } })).toBe('cancelled');
    expect(writeText).not.toHaveBeenCalled();
  });
  it('copies the public URL when native sharing is unavailable or denied', async () => {
    for (const share of [undefined, vi.fn().mockRejectedValue(new Error('denied'))]) {
      const writeText=vi.fn().mockResolvedValue(undefined);
      expect(await shareGame('Xadrez',url,{share,clipboard:{writeText}})).toBe('copied');
      expect(writeText).toHaveBeenCalledWith(url);
    }
  });
  it('reports an unavailable fallback without throwing or showing false success', async () => {
    expect(await shareGame('Xadrez',url,{})).toBe('unavailable');
  });
});
