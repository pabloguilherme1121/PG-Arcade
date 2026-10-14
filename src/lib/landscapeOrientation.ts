/** Rotation is optional: unsupported/denied APIs must never prevent play or exit. */
export function preferLandscape(): () => void {
  const orientation = screen.orientation as ScreenOrientation & {
    lock?: (value: "landscape") => Promise<void>;
  };
  if (!orientation?.lock || !matchMedia("(pointer: coarse)").matches) return () => {};
  let disposed = false;
  let locked = false;
  const unlock = () => { try { orientation.unlock(); } catch { /* Unsupported browser. */ } };
  try {
    void orientation.lock("landscape").then(() => {
      locked = true;
      if (disposed) unlock();
    }).catch(() => undefined);
  } catch { /* Older implementations may throw synchronously. */ }
  return () => { disposed = true; if (locked) unlock(); };
}
