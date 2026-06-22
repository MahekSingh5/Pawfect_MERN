const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// ----------------------------
// SAFE JSON PARSER
// ----------------------------
const safeJSONParse = (text) => {
  try {
    if (!text) return null;

    // remove markdown formatting
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.log("JSON Parse Error:", err.message);

    return {
      severity: "LOW",
      priorityScore: 1,
      reasoning: "AI parsing failed, fallback response used",
    };
  }
};

// ----------------------------
// RESCUE GUIDANCE (TEXT OUTPUT)
// ----------------------------
const generateRescueGuidance = async (question) => {
  const prompt = `
You are an animal rescue expert.
Give emergency guidance in simple words.
Keep response short and actionable.

User Question:
${question}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// ----------------------------
// SEVERITY ANALYSIS (JSON OUTPUT)
// ----------------------------
const analyzeSeverity = async (description) => {
  const prompt = `
You are an animal rescue triage expert.
Return ONLY valid JSON. No markdown, no explanation.

Format:
{
  "severity": "LOW | MEDIUM | HIGH",
  "priorityScore": 1-10,
  "reasoning": "short explanation"
}

Report:
${description}
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  return safeJSONParse(responseText);
};

module.exports = {
  generateRescueGuidance,
  analyzeSeverity,
};