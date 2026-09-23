const { recordGeminiError, clearGeminiError, classifyGeminiError } = require('./settings');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gemini (one retry) -> OpenRouter -> null. Never throws: callers turn a
 * null into their own "analysis failed" placeholder so the photo/meal is
 * still saved. The Gemini error flag (shown on the Settings screen) tracks
 * Gemini's health only, so it's recorded even when OpenRouter rescues the
 * request.
 */
async function runWithFallback(label, { gemini, openrouter }) {
  let geminiErr;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await gemini();
      await clearGeminiError();
      return { result, provider: 'gemini' };
    } catch (err) {
      geminiErr = err;
      console.error(`[${label}] gemini attempt ${attempt} failed:`, err.message);
      // A spent daily quota won't recover in a second — skip the retry.
      if (classifyGeminiError(err) === 'rate_limit') break;
      if (attempt === 1) await sleep(1000);
    }
  }

  await recordGeminiError(geminiErr);

  try {
    const result = await openrouter();
    console.log(`[${label}] served by openrouter fallback`);
    return { result, provider: 'openrouter' };
  } catch (err) {
    console.error(`[${label}] openrouter fallback failed:`, err.message);
    return null;
  }
}

module.exports = { runWithFallback };
