const Problem = require("../../../../BriefIt/BriefItBackend/src/models/problem");

const CATEGORIES = [
  "education",
  "healthcare",
  "agriculture",
  "water",
  "sanitation",
  "environment",
  "energy",
  "urban_development",
  "accessibility",
  "public_administration",
  "rural_livelihoods",
];

async function classifyProblem(title, description, district) {
  const existingProblems = await Problem.find({
    "location.district": district,
    status: { $ne: "rejected" },
  })
    .select("_id title description")
    .limit(20);

  const existingList = existingProblems
    .map(
      (p) => `ID: ${p._id} | Title: ${p.title} | Description: ${p.description}`,
    )
    .join("\n");

  const prompt = `
You are classifying a civic problem submission.

Categories (pick exactly one): ${CATEGORIES.join(", ")}

New problem:
Title: ${title}
Description: ${description}

Existing problems in the same district:
${existingList || "None"}

Return ONLY valid JSON, no markdown, no explanation, in this exact shape:
{
  "category": "one of the categories above",
  "rank": 1,
  "aiTags": ["keyword1", "keyword2"],
  "isDuplicate": false,
  "duplicateOf": null
}

Rules:
- "rank" is urgency/severity from 1 (low) to 5 (critical).
- "isDuplicate" is true only if the new problem clearly describes the same real-world issue as one of the existing problems.
- "duplicateOf" must be the exact ID string of the matching existing problem, or null.
`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: false,
      }),
    },
  );
  const data = await response.json();
  const raw = data.choices[0].message.content.trim();
  const cleaned = raw.replace(/```json|```/g, "").trim();

  return JSON.parse(cleaned);
}

module.exports = { classifyProblem };
