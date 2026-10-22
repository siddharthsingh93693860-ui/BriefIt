/**
 * TinyFish web-research enrichment.
 *
 * After a citizen submits a problem, we use the TinyFish Search API
 * (https://docs.tinyfish.ai/search-api/reference) to collect public web
 * sources about that issue in that district (govt schemes, news, NGO work)
 * and store them on the problem as `webContext`.
 *
 * Design rules:
 *  - Opt-in: if TINYFISH_API_KEY is not set, everything here is a no-op.
 *  - Never throws into the request path: enrichProblem() swallows errors and
 *    records them on the problem instead.
 *  - Mirrors aiClassification.js: plain global fetch, config from env.
 */

const Problem = require("../models/problem");

const DEFAULT_SEARCH_URL = "https://api.search.tinyfish.ai";
const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_MAX_RESULTS = 5;
const MAX_QUERY_LENGTH = 300;
const MAX_SNIPPET_LENGTH = 500;

function getConfig(env = process.env) {
  const maxResults = parseInt(env.TINYFISH_MAX_RESULTS, 10);
  const timeoutMs = parseInt(env.TINYFISH_TIMEOUT_MS, 10);
  return {
    apiKey: (env.TINYFISH_API_KEY || "").trim(),
    searchUrl: env.TINYFISH_SEARCH_URL || DEFAULT_SEARCH_URL,
    location: env.TINYFISH_SEARCH_LOCATION || "IN",
    language: env.TINYFISH_SEARCH_LANGUAGE || "en",
    maxResults: maxResults > 0 ? maxResults : DEFAULT_MAX_RESULTS,
    timeoutMs: timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS,
  };
}

function isEnabled(env = process.env) {
  return getConfig(env).apiKey.length > 0;
}

function buildQuery(problem) {
  const parts = [
    problem.title,
    problem.location && problem.location.district,
    problem.category ? String(problem.category).replace(/_/g, " ") : null,
  ].filter(Boolean);
  return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

function buildPurpose(problem) {
  const district = problem.location && problem.location.district;
  return (
    `Find existing government schemes, news coverage and NGO/community ` +
    `initiatives relevant to this civic problem${district ? ` in ${district}` : ""}: ` +
    `${problem.title}`
  ).slice(0, 2000);
}

/**
 * Calls the TinyFish Search API and returns normalized sources.
 * Throws on network/HTTP errors; callers decide how to handle that.
 */
async function searchWeb(query, { purpose, env = process.env, fetchImpl } = {}) {
  const config = getConfig(env);
  if (!config.apiKey) {
    throw new Error("TINYFISH_API_KEY is not set");
  }
  const doFetch = fetchImpl || globalThis.fetch;

  const url = new URL(config.searchUrl);
  url.searchParams.set("query", query);
  url.searchParams.set("location", config.location);
  url.searchParams.set("language", config.language);
  if (purpose) url.searchParams.set("purpose", purpose);

  const response = await doFetch(url.toString(), {
    method: "GET",
    headers: { "X-API-Key": config.apiKey },
    signal: AbortSignal.timeout(config.timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`TinyFish Search failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  const results = Array.isArray(data && data.results) ? data.results : [];

  return results
    .filter((r) => r && typeof r.url === "string" && r.url)
    .slice(0, config.maxResults)
    .map((r) => ({
      title: r.title || r.site_name || r.url,
      url: r.url,
      snippet: (r.snippet || "").slice(0, MAX_SNIPPET_LENGTH),
      siteName: r.site_name || null,
      publishedAt: r.date || null,
    }));
}

/**
 * Researches a problem document and returns the `webContext` payload.
 */
async function researchProblem(problem, opts = {}) {
  const query = buildQuery(problem);
  const sources = await searchWeb(query, {
    purpose: buildPurpose(problem),
    ...opts,
  });
  return { status: "completed", query, sources, fetchedAt: new Date() };
}

/**
 * Fire-and-forget entry point used by the controller. Loads the problem,
 * researches it, and writes `webContext`. Never throws.
 */
async function enrichProblem(
  problemId,
  { Model = Problem, env = process.env, fetchImpl, logger = console } = {},
) {
  if (!isEnabled(env)) return null;

  try {
    const problem = await Model.findById(problemId);
    if (!problem || problem.isDuplicate) return null;

    let webContext;
    try {
      webContext = await researchProblem(problem, { env, fetchImpl });
    } catch (err) {
      webContext = {
        status: "failed",
        query: buildQuery(problem),
        sources: [],
        error: String(err && err.message ? err.message : err).slice(0, 300),
        fetchedAt: new Date(),
      };
      logger.error(
        `TinyFish enrichment failed for problem ${problemId}: ${webContext.error}`,
      );
    }

    await Model.findByIdAndUpdate(problemId, { webContext });
    return webContext;
  } catch (err) {
    logger.error(
      `TinyFish enrichment error for problem ${problemId}: ${err.message}`,
    );
    return null;
  }
}

module.exports = {
  enrichProblem,
  researchProblem,
  searchWeb,
  buildQuery,
  getConfig,
  isEnabled,
};
