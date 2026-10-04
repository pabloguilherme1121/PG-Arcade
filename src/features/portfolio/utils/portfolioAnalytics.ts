// Local events only: the standalone Arcade does not send gameplay to a server.
export function trackPortfolioEvent(
  name: string,
  properties?: Record<string, unknown>,
) {
  window.dispatchEvent(
    new CustomEvent("pg:game-event", { detail: { name, properties } }),
  );
}
