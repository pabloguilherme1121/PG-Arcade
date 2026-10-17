export function revealPlayfield(surface: HTMLElement | null) {
  const player = surface?.closest<HTMLElement>('[data-immersive="true"]');
  if (!surface || !player || surface.closest('[inert]')) return;
  const landscape = matchMedia('(orientation: landscape) and (min-width: 568px) and (max-height: 540px)').matches;
  if (!landscape && !matchMedia('(max-width: 760px)').matches) return;
  const field = landscape
    ? surface.closest<HTMLElement>('.motion-stage,.action-playfield,.board-column,.blocks-board')
    : surface.closest<HTMLElement>('.motion-stage,.action-playfield') || surface;
  requestAnimationFrame(() => {
    if (!field?.isConnected || field.closest('[inert]') || field.closest('[data-immersive="true"]') !== player) return;
    if (landscape && !field.matches('.blocks-board')) {
      field.scrollIntoView({ block: 'start', behavior: 'instant' });
      return;
    }
    const bounds = player.getBoundingClientRect();
    const toolbar = player.querySelector('.player-toolbar')?.getBoundingClientRect();
    const clearance = Math.max(0, (toolbar?.bottom ?? bounds.top) - bounds.top) + 12;
    player.scrollTo({
      top: Math.max(0, player.scrollTop + field.getBoundingClientRect().top - bounds.top - clearance),
      behavior: 'instant',
    });
  });
}
