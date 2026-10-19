export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'unavailable';
type SharePlatform = { share?: Navigator['share']; clipboard?: Pick<Clipboard, 'writeText'> };

/** Share only the public game route, never query parameters or session tokens. */
export async function shareGame(title: string, url: string, platform: SharePlatform = navigator): Promise<ShareResult> {
  if (typeof platform.share === 'function') {
    try {
      await platform.share({ title, url });
      return 'shared';
    } catch (error) {
      // Dismissing the system sheet must not silently copy anything.
      if (error instanceof Error && error.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    if (!platform.clipboard) return 'unavailable';
    await platform.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'unavailable';
  }
}
