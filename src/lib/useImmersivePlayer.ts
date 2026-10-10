import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/** Native fullscreen with an accessible viewport fallback for mobile browsers. */
export function useImmersivePlayer(player: RefObject<HTMLDivElement | null>, route: string) {
  const [native, setNative] = useState(false);
  const [viewport, setViewport] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const pending = useRef(false);
  const generation = useRef(0);
  const active = native || viewport;

  useEffect(() => {
    const change = () => setNative(document.fullscreenElement === player.current && !!player.current);
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, [player]);

  useEffect(() => {
    const element = player.current;
    generation.current++;
    setViewport(false);
    setNative(false);
    return () => {
      generation.current++;
      if (document.fullscreenElement === element && document.fullscreenElement)
        void document.exitFullscreen().catch(() => undefined);
    };
  }, [route, player]);

  useEffect(() => {
    if (!active || !player.current) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const siblings: Array<[HTMLElement, boolean]> = [];
    let branch: HTMLElement | null = player.current;
    while (branch?.parentElement && branch.parentElement !== document.body) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          siblings.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      }
      branch = branch.parentElement;
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !viewport || player.current?.querySelector("dialog[open]")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setViewport(false);
    };
    window.addEventListener("keydown", escape, true);
    return () => {
      document.body.style.overflow = overflow;
      siblings.forEach(([element, inert]) => { element.inert = inert; });
      window.removeEventListener("keydown", escape, true);
      if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
    };
  }, [active, viewport, player]);

  const toggle = useCallback(async (trigger?: HTMLElement) => {
    if (pending.current) return;
    if (viewport) { setViewport(false); return; }
    if (document.fullscreenElement === player.current && document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }
    returnFocus.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const element = player.current;
    if (!element) return;
    const current = generation.current;
    pending.current = true;
    try {
      if (!document.fullscreenEnabled || !element.requestFullscreen) throw new Error("viewport");
      await element.requestFullscreen();
    } catch {
      if (generation.current === current) setViewport(true);
    } finally {
      pending.current = false;
    }
  }, [player, viewport]);
  return { active, viewport, toggle };
}
