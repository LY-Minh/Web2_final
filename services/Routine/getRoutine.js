class RoutineService {
  constructor() {
    this.apiKey = "AIzaSyAmU7tkXFSAhpAJaB9w4RCucNPjBO6Pd5w"; 
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  }
// this is very important function, we need to build the system instruction her
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
      Example Response:
      {
        "status": "success",
        "week_plan": [
          {
            "day": "Monday",
            "focus": "Upper Body Strength",
            "exercises": [
              {"name": "Push-ups", "sets": 4, "reps": 12},
              {"name": "Pull-ups", "sets": 4, "reps": 8}
            ]
          },
          ...
        ]
      }
    `;
  }
// base url is received from dissecting curl command from google gemini api playground
  async generateRoutine(userInput) {
    try {
      console.log("Sending request to Gemini..."); //for debugging
      const instruction = this.buildSystemInstruction(userInput);

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: instruction }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      const data = await response.json();
      console.log("Received response from Gemini:", data);
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text; //extract raw text. Despite careful prompt engineer, some responses may still not be valid JSON.
      
      if (!rawText) { //guard clause for early exit
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