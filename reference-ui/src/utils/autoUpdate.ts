// iOS home-screen apps often resume the old page from memory instead of
// reloading it, so a new deploy can go unseen indefinitely. On launch and
// every time the app comes back to the foreground, compare the build this
// page is running against the one the server is serving, and reload if
// they differ.
const SCRIPT_SRC = /<script[^>]*src="(\/assets\/[^"]+\.js)"/;

const runningScript =
  document.querySelector<HTMLScriptElement>('script[src^="/assets/"]')?.getAttribute('src') ?? null;

export const BUILD_ID = runningScript?.match(/index-([\w-]+)\.js/)?.[1] ?? 'dev';

async function checkForUpdate() {
  if (!runningScript) return;
  let latest: string | undefined;
  try {
    const html = await fetch('/', { cache: 'no-store' }).then((r) => r.text());
    latest = html.match(SCRIPT_SRC)?.[1];
  } catch {
    return;
  }
  if (!latest || latest === runningScript) return;

  // Guard against a reload loop if the phone keeps handing back a stale
  // page: only try once per new build, and use a fresh URL to bypass it.
  try {
    if (sessionStorage.getItem('reloaded-for') === latest) return;
    sessionStorage.setItem('reloaded-for', latest);
  } catch {
    // storage unavailable — still reload once
  }
  location.replace(`/?v=${encodeURIComponent(latest)}`);
}

export function installAutoUpdate() {
  checkForUpdate();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  });
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) checkForUpdate();
  });
}
