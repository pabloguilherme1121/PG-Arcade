import { afterEach, expect, it, vi } from "vitest";
import { preferLandscape } from "./landscapeOrientation";

afterEach(() => vi.unstubAllGlobals());
function setup(lock: () => Promise<void>, coarse = true) {
  const unlock = vi.fn();
  vi.stubGlobal("screen", { orientation: { lock, unlock } });
  vi.stubGlobal("matchMedia", () => ({ matches: coarse }));
  return unlock;
}
it("releases a successful landscape lock when fullscreen exits", async () => {
  const lock = vi.fn().mockResolvedValue(undefined);
  const unlock = setup(lock);
  const exit = preferLandscape();
  await Promise.resolve();
  expect(lock).toHaveBeenCalledWith("landscape");
  exit();
  expect(unlock).toHaveBeenCalledOnce();
});
it("releases a late lock after navigation has already disposed fullscreen", async () => {
  let resolve!: () => void;
  const unlock = setup(() => new Promise<void>(done => { resolve = done; }));
  preferLandscape()();
  resolve();
  await Promise.resolve();
  expect(unlock).toHaveBeenCalledOnce();
});
it("denied rotation leaves exit working without unlocking another app's lock", async () => {
  const unlock = setup(() => Promise.reject(new Error("not supported")));
  const exit = preferLandscape();
  await Promise.resolve();
  await Promise.resolve();
  expect(exit).not.toThrow();
  expect(unlock).not.toHaveBeenCalled();
});
it("does not request rotation for a desktop pointer", () => {
  const lock = vi.fn();
  setup(lock, false);
  preferLandscape()();
  expect(lock).not.toHaveBeenCalled();
});
it("does not throw when matchMedia is unavailable in an embedded browser", () => {
  const lock = vi.fn();
  setup(lock);
  vi.stubGlobal("matchMedia", undefined);
  expect(() => preferLandscape()()).not.toThrow();
  expect(lock).not.toHaveBeenCalled();
});
it("handles missing or synchronously failing orientation APIs", () => {
  vi.stubGlobal("screen", {});
  expect(preferLandscape() ).toBeTypeOf("function");
  setup(() => { throw new Error("unsupported"); });
  expect(() => preferLandscape()()).not.toThrow();
});

it("keeps boards free to rotate automatically and honors explicit orientation", async () => {
  const { gameOrientation } = await import("./landscapeOrientation");
  expect(gameOrientation("xadrez", "auto")).toBeNull();
  expect(gameOrientation("2048", "auto")).toBeNull();
  expect(gameOrientation("corrida", "auto")).toBe("landscape");
  expect(gameOrientation("xadrez", "landscape")).toBe("landscape");
  expect(gameOrientation("corrida", "portrait")).toBe("portrait");
});
