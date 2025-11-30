class RoutineService {
  constructor() {
    this.apiKey = "AIzaSyDhBICecmq1H4oR-Z_4ceQxkEW9PFRTGKk";
    this.baseUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  }

  buildSystemInstruction(userInput) {
    return `  
      You are a strict fitness API. 
      Analyze the user input: "${userInput}"
      
      RULES:
      1. If unrelated to fitness, return: {"status": "fail", "error": "irrelevant_prompt"}
      2. If related, generate a 7-day workout plan.
      3. Return strictly valid JSON: {"status": "success", "week_plan": [ ... ]}
      4. Each day must have "day", "focus", and "exercises" (name, sets, reps).
      
      Do not use markdown. Return raw JSON only.
    `;
  }

  async generateRoutine(userInput) {
    try {
      console.log("Sending request to Gemini...");
      const instruction = this.buildSystemInstruction(userInput);

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: instruction }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });

      const data = await response.json();
      console.log("Received response from Gemini:", data);
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        console.error("Unexpected API Response structure:", data);
        throw new Error("No content generated. Check console for details.");
      }

      const routine = JSON.parse(rawText);

      if (routine.status === "fail") {
        throw new Error(routine.error || "Routine generation failed");
      }

      return routine;
    } catch (error) {
      console.error("Final Error Caught:", error);
      throw error;
    }
  }
}

export default RoutineService;
