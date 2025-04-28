import JSON5 from 'json5';
function fixBrokenJson(input) {
  // Replace newlines inside double quotes with a space
  return input.replace(/"([^"]*)\n([^"]*)"/g, (match, p1, p2) => {
    return `"${p1} ${p2}"`;
  });
}
function cleanAndParseJson(input) {
  // console.log('input', input);
  try {
    const cleanedInput = input
      .replace(/^```json\s*/g, '')
      .replace(/\s*```$/g, '');
      const fixedInput = fixBrokenJson(cleanedInput);
    return JSON.parse(fixedInput);
  } catch {
    try {
      return JSON5.parse(input);
    } catch (error) {
      console.log(error)
      throw new Error(`Failed to parse JSON: ${error.message}`);
    }
  }
}
function generatePrompt(subject) {
  return ` I need a comprehensive learning roadmap for "${subject}" in JSON format that I can render in a React application. 
        First, correct any spelling mistakes in the subject to use the proper terminology (like "web development" instead of "web devlpemnt").
        Then follow these strict requirements:
        1. JSON Structure:
        - a single object with 2 values "roadmap_title" and "modules"
        - Top-level string "roadmap_title"
        - Top-level array of "modules"
        - Each module must have:
          * "module" (string): Module name
          * "submodules" (array)
          * Each submodule must have:
            - "submodule" (string): Submodule name
            - "topics" (array of strings): key topics in the submodule
            - "estimated_time" (string): e.g., "2-3 hours"
            - "resources" (array of objects with "title" and "url")
        2. Key Formatting:
        - ALL JSON keys must be in snake_case (e.g., "estimated_time", "submodule", "roadmap_title")
        - Values (title, module names, topics, etc.) should use normal English capitalization
        2. Content Requirements:
        - Use the corrected subject name throughout
        - Include both fundamental and advanced topics
        - Group related topics logically
        - Provide practical project suggestions
        - Include estimated time commitments
        - Include quality resource links
        3. Formatting Rules:
        - Use consistent naming (lowercase_with_underscores)
        - No markdown or additional commentary
        - Only return valid JSON (no code fences or explanations)
        - Do NOT use any escape characters like '\n', '+' , "'"
        
        Example for "web devlpemnt" should return structure for "web development":
        {
            "roadmap_title: "web development roadmap",
            "modules": [
              {
                "module": "Foundations of Web Development",
                "submodules": [
                  {
                    "submodule": "HTML Basics",
                    "estimated_time": "3-4 hours",
                    "resources": [
                      {
                        "title": "MDN HTML Guide",
                        "url": "https://developer.mozilla.org/en-US/docs/Learn/HTML"
                      }
                    ],
                    "topics": [
                      "HTML document structure",
                      "Semantic HTML elements"
                    ]
                  }
                ]
              }
            ]
        }
        Important: 
        1. First correct any spelling mistakes in the subject
        2. Then return ONLY the raw JSON object for the CORRECTED subject
        3. No additional text or formatting outside the JSON
        `;
}

function generateQuizPrompt(module) {
  return `
You're a quiz generator. Based on the following module content, generate 3 to 5 multiple choice questions (with 4 options each and one correct answer marked):

Title: ${module.module}
Content: ${module.submodules.map(
    (submodule) => `
  Submodule: ${submodule.submodule}
  Topics: ${submodule.topics.join(', ')}`
  )}


Return A single array like:
[
  {
    "question": "...",
    "options": [{"label":"A", "text": "correct option"}, {"label":"A", "text": "wrong option"}, {"label":"A", "text": "wrong option"}, {"label":"A", "text": "wrong option"}],
    "correctOption": "A"
  },
  ...
]
  Important: 
        1. The questions should be based on the topics and submodules provided.
        2. The question should end with a question mark.
        3. The options should be labeled A, B, C, D. The correct answer should be one of the options.
        4. No additional text or formatting outside the array.
        5. DO NOT break strings into multiple lines. Keep all question and option texts in a single line inside quotes.
`;
}

function isAIResponse(data) {
  if (!data || typeof data !== 'object') return false;
  return (
    data &&
    typeof data.roadmap_title === 'string' &&
    Array.isArray(data.modules)
  );
}

function isAIResponseQuiz(data) {
  if (!Array.isArray(data)) return false;

  return data.every((q) => {
    const hasQuestion =
      typeof q.question === 'string' && q.question.endsWith('?');
    const hasOptions =
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.options.every(
        (opt) =>
          typeof opt.label === 'string' &&
          ['A', 'B', 'C', 'D'].includes(opt.label) &&
          typeof opt.text === 'string'
      );
    const hasCorrectOption =
      typeof q.correctOption === 'string' &&
      ['A', 'B', 'C', 'D'].includes(q.correctOption);

    return hasQuestion && hasOptions && hasCorrectOption;
  });
}
export {
  isAIResponseQuiz,
  cleanAndParseJson,
  generatePrompt,
  isAIResponse,
  generateQuizPrompt,
};
