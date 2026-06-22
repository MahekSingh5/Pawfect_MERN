function cleanGeminiResponse(text) {
  try {
    if (!text) return null;

    // remove markdown blocks
    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.log("Gemini parse failed:", err.message);

    // fallback safe object
    return {
      severity: "LOW",
      category: "unknown",
      description: "AI parsing failed",
      recommendedAction: "Manual review required",
      confidence: 0
    };
  }
}

module.exports = cleanGeminiResponse;