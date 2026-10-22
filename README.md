# BriefIt

Civic-problem platform: citizens submit local problems, an AI classifier ranks and de-duplicates them, universities claim and solve them, and industries fund approved solutions.

- `BriefItBackend/` – Node.js, Express 5, MongoDB (Mongoose), Groq for classification
- `BriefItFrontend/` – React 19 + Vite

## Prerequisites

- Node.js 20+ (tested on 22)
- A MongoDB instance (local or Atlas)
- A [Groq](https://console.groq.com) API key (existing requirement)
- Optional: a [TinyFish](https://docs.tinyfish.ai) API key for web-research enrichment

## Installation

```bash
cd BriefItBackend && npm install
cd ../BriefItFrontend && npm install
```

## Configuration

Create `BriefItBackend/.env` (copy `BriefItBackend/.env.example`). **Never commit this file.**

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MONGO_URI` | yes | – | MongoDB connection string |
| `GROQ_API_KEY` | yes | – | Problem classification |
| `PORT` | no | `5000` | Backend port (the frontend expects `5000`) |
| `TINYFISH_API_KEY` | no | – | Enables TinyFish enrichment. Unset = feature off, app behaves exactly as before |
| `TINYFISH_SEARCH_URL` | no | `https://api.search.tinyfish.ai` | Search API endpoint |
| `TINYFISH_SEARCH_LOCATION` | no | `IN` | Two-letter country code for geo-targeting |
| `TINYFISH_SEARCH_LANGUAGE` | no | `en` | Result language |
| `TINYFISH_MAX_RESULTS` | no | `5` | Max sources stored per problem |
| `TINYFISH_TIMEOUT_MS` | no | `15000` | Per-request timeout |

## Running

```bash
# backend (from BriefItBackend)
node src/server.js          # http://localhost:5000

# frontend (from BriefItFrontend)
npm run dev                 # http://localhost:5173
```

## TinyFish integration

**What it does.** When a citizen submits a problem, TinyFish's [Search API](https://docs.tinyfish.ai/search-api/reference) gathers public web sources about that issue in that district (government schemes, news, NGO/community work). The sources are saved on the problem as `webContext` so universities and reviewers have real-world context.

**Flow.**

1. `POST /api/problems` runs exactly as before: Groq classification, save, `201` response.
2. After the response is sent, `enrichProblem(problemId)` (`src/services/tinyfishResearch.js`) runs in the background:
   - builds a query from `title + district + category`,
   - calls `GET https://api.search.tinyfish.ai` with the `X-API-Key` header,
   - saves the result on the problem.
3. Read it from the existing `GET /api/problems` and `GET /api/problems/:id` as `problem.webContext`:

```json
{
  "status": "completed",
  "query": "Broken handpump Jaipur water",
  "sources": [
    { "title": "…", "url": "https://…", "snippet": "…", "siteName": "…", "publishedAt": "2026-01-01" }
  ],
  "fetchedAt": "2026-10-22T13:00:00.000Z"
}
```

**Safety properties.**

- No `TINYFISH_API_KEY` means no network calls and no DB writes; behavior is unchanged.
- Enrichment never blocks or fails problem submission. Errors (HTTP errors, timeouts, rate limits) are stored as `webContext.status = "failed"` with a short `error`.
- Duplicate (auto-rejected) problems are not enriched.
- The enrichment is not retried, and it is in-process: if the server restarts mid-request, that problem simply has no `webContext`.
- TinyFish's default limit is 30 requests/minute per key; bursts beyond that are recorded as failed.

**Files.** `src/services/tinyfishResearch.js` (new), `src/models/problem.js` (optional `webContext` field), `src/controllers/problem.controller.js` (one background call). The frontend is unchanged.

## Tests

```bash
cd BriefItBackend
npm test
```

Uses Node's built-in test runner (no new dependencies). All HTTP and database access is mocked, so no keys or MongoDB are needed. Covers the TinyFish client (headers, params, normalization, errors), the enrichment function, the model field, and the real `createProblem` controller (unchanged response, no-key no-op, failure isolation, duplicates).

Frontend checks: `cd BriefItFrontend && npm run lint && npm run build`.

## Security note

`BriefItBackend/.env` was committed to git in this repository and contains live credentials. Rotate the MongoDB and Groq credentials, then run `git rm --cached BriefItBackend/.env`. `.env` is now listed in `BriefItBackend/.gitignore`.
