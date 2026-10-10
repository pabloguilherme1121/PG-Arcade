export function revealPlayfield(surface: HTMLElement | null) {
  if (!surface?.closest('[data-immersive="true"]') ||
      !matchMedia('(orientation: landscape) and (min-width: 568px) and (max-height: 540px)').matches) return;
  const field = surface.closest<HTMLElement>('.motion-stage,.action-playfield,.board-column');
  requestAnimationFrame(() => {
    if (field?.isConnected && field.closest('[data-immersive="true"]'))
      field.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
}
