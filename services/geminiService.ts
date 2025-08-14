


import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import type { CodeError, Platform, Solution, WebViewCode, Project, ProjectHealthAnalysis, Diagnostic, DiagnosticSeverity } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        solutions: {
            type: Type.ARRAY,
            description: "A list of potential solutions for the code error.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "A short, descriptive title for the solution (e.g., 'Add Null Check')."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A brief explanation of why this solution works and what it does."
                    },
                    fixedCode: {
                        type: Type.STRING,
                        description: "The complete, corrected code snippet that replaces the erroneous line(s)."
                    },
                    confidence: {
                        type: Type.NUMBER,
                        description: "A confidence score between 0.0 and 1.0 indicating how likely the solution is to be correct."
                    }
                },
                 required: ["title", "description", "fixedCode", "confidence"]
            }
        }
    },
    required: ["solutions"]
};

export const generateSolutionsForError = async (error: CodeError, platform: Platform, code: string): Promise<Solution[]> => {
    const systemInstruction = `You are an expert software engineer specializing in code analysis and debugging for ${platform.toUpperCase()} applications. Your task is to provide concise, accurate, and actionable solutions for given code errors.`;

    const prompt = `
      Analyze the following code error and provide 2-3 distinct, high-quality fix suggestions.

      **Context:**
      - **Platform:** ${platform.toUpperCase()}
      - **Error Message:** "${error.message}"
      - **Error Type:** ${error.type}
      - **Severity:** ${error.severity}
      - **Location:** Line ${error.line}, Column ${error.column}

      **Erroneous Code Snippet:**
      \`\`\`
      ${error.code}
      \`\`\`

      **Full Code Context (for reference):**
      \`\`\`${platform}
      ${code}
      \`\`\`

      **Instructions:**
      1.  Carefully analyze the error in the context of the full code.
      2.  Generate 2-3 solutions. Each solution must include a title, a brief description, the corrected code snippet, and a confidence score.
      3.  The \`fixedCode\` should be a direct replacement for the original erroneous line(s). If the fix involves removing the line, \`fixedCode\` should be an empty string.
      4.  Provide a confidence score from 0.0 to 1.0.
      5.  Respond ONLY with the JSON object matching the provided schema. Do not include markdown backticks like \`\`\`json\`\`\` around your response.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.3
            }
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (parsedResponse && Array.isArray(parsedResponse.solutions)) {
            return parsedResponse.solutions;
        }

        console.warn("Received unexpected response format from Gemini for solutions.");
        return [];
    } catch (e) {
        console.error("Error generating solutions with Gemini:", e);
        return [];
    }
};

const webCodeResponseSchema = {
    type: Type.OBJECT,
    properties: {
        html: {
            type: Type.STRING,
            description: "The HTML code for the component. It should be self-contained within a single parent element."
        },
        css: {
            type: Type.STRING,
            description: "The CSS styles for the component. All styles should be scoped to the component and not affect global tags like 'body' unless specifically asked."
        },
        js: {
            type: Type.STRING,
            description: "The JavaScript code for the component. It should be vanilla JavaScript and handle DOM manipulation and event listeners. The code should be wrapped in an event listener for DOMContentLoaded to ensure the DOM is ready."
        }
    },
    required: ["html", "css", "js"]
};


export const generateWebCode = async (prompt: string): Promise<WebViewCode | null> => {
    const systemInstruction = "You are an expert web developer. Your task is to generate clean, self-contained HTML, CSS, and vanilla JavaScript code based on a user's prompt. The generated code should be ready to be embedded in a preview pane.";

    const fullPrompt = `
      Generate the HTML, CSS, and JavaScript for the following request.

      **User Request:** "${prompt}"

      **Instructions:**
      1.  **HTML:** Create semantic and minimal HTML. Wrap it in a single root div if possible.
      2.  **CSS:** Write clean CSS. Avoid global styles (e.g., on \`body\`, \`html\`) unless absolutely necessary.
      3.  **JavaScript:** Write vanilla JavaScript. If you need to manipulate the DOM, make sure to wait for the DOM to be loaded. All JS code should be functional and self-contained.
      4.  Respond ONLY with the JSON object matching the provided schema. Do not include markdown backticks like \`\`\`json\`\`\` around your response.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: webCodeResponseSchema,
                temperature: 0.4
            }
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        if (parsedResponse && typeof parsedResponse.html === 'string' && typeof parsedResponse.css === 'string' && typeof parsedResponse.js === 'string') {
            return parsedResponse as WebViewCode;
        }
        
        console.warn("Received unexpected response format from Gemini for web code.");
        return null;
    } catch (e) {
        console.error("Error generating web code with Gemini:", e);
        return null;
    }
};

export const generateUnitTests = async (platform: Platform, code: string): Promise<string> => {
    const getTestFramework = (platform: Platform) => {
        switch(platform) {
            case 'web': return 'Jest';
            case 'android': return 'JUnit and Mockito';
            case 'flutter': return 'the built-in `test` package';
        }
    }

    const prompt = `
      You are an expert QA engineer specializing in writing unit tests for ${platform.toUpperCase()} applications using ${getTestFramework(platform)}.
      Your task is to write a comprehensive and effective unit test suite for the provided code.

      **Code to Test:**
      \`\`\`${platform}
      ${code}
      \`\`\`

      **Instructions:**
      1.  Write the unit tests in a single code block.
      2.  The tests should be complete, runnable, and cover the main logic, edge cases, and potential failure points found in the code.
      3.  For UI-related code (like Android Activities or Flutter Widgets), provide widget tests or basic instrumentation tests where appropriate.
      4.  Ensure necessary imports and mock setups are included.
      5.  Respond ONLY with the code. Do not include any explanations, introductions, or markdown formatting like \`\`\`dart or \`\`\`javascript. Just the raw code.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.2,
            }
        });
        return response.text;
    } catch (e) {
        console.error("Error generating unit tests with Gemini:", e);
        return "/* Error generating tests. Please check the console for details. */";
    }
};

export const generateDocsForCode = async (platform: Platform, code: string): Promise<string> => {
    const getDocStyle = (platform: Platform) => {
        switch (platform) {
            case 'web': return 'JSDoc';
            case 'android': return 'KDoc/JavaDoc';
            case 'flutter': return 'DartDoc';
        }
    };

    const prompt = `
      You are an expert software developer with a talent for writing clear and concise documentation.
      Your task is to take a piece of code and add comprehensive documentation to it without altering its functionality.

      **Platform:** ${platform.toUpperCase()}
      **Documentation Style:** Use ${getDocStyle(platform)} format.

      **Instructions:**
      1.  Add a summary comment at the top of the file if one doesn't exist.
      2.  For each function, class, and method, add a doc comment explaining its purpose, parameters, and return value.
      3.  Add inline comments for complex or non-obvious lines of code.
      4.  DO NOT change any of the existing code's logic.
      5.  Return the **entire code file** with the documentation added. Respond ONLY with the raw code, no other text or markdown formatting.

      **Code to Document:**
      \`\`\`${platform}
      ${code}
      \`\`\`
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.4,
            }
        });
        return response.text;
    } catch (e) {
        console.error("Error generating documentation with Gemini:", e);
        return `/* Error generating documentation. Please check the console for details. \n\n${code} */`;
    }
};

export const optimizeCode = async (platform: Platform, code: string): Promise<string> => {
    const prompt = `
      You are an expert software architect specializing in code optimization and best practices for ${platform.toUpperCase()}.
      Your task is to take a piece of code and refactor it for improved performance, readability, and robustness without changing its core functionality.

      **Platform:** ${platform.toUpperCase()}

      **Instructions:**
      1.  Analyze the provided code for potential optimizations (e.g., better algorithms, safer patterns, modern language features, functional approaches).
      2.  Rewrite the code to apply these optimizations.
      3.  Add brief comments explaining the key optimizations you made.
      4.  Return the **entire optimized code file**. Respond ONLY with the raw code, no other text or markdown formatting.

      **Code to Optimize:**
      \`\`\`${platform}
      ${code}
      \`\`\`
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.5,
            }
        });
        return response.text;
    } catch (e) {
        console.error("Error optimizing code with Gemini:", e);
        return `/* Error optimizing code. Please check the console for details. \n\n${code} */`;
    }
};


export const explainOrGenerateCode = async (prompt: string): Promise<string> => {
    const systemInstruction = `You are Mona, a helpful AI code assistant integrated into the FireFly IDE. Your primary function is to help users by explaining code, generating new code snippets, or debugging existing code based on their prompts. Format code blocks using markdown with language identifiers (e.g., \`\`\`javascript).`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.5,
            }
        });
        return response.text;
    } catch (e) {
        console.error("Error with AI code assistant:", e);
        return "Sorry, I was unable to process your request. Please check the console for more details.";
    }
};

const healthAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "A score from 0 to 100 representing project health." },
    summary: { type: Type.STRING, description: "A brief, one-paragraph summary of the project's health." },
    issues: {
      type: Type.ARRAY,
      description: "A list of identified issues.",
      items: {
        type: Type.OBJECT,
        properties: {
          severity: { type: Type.STRING, enum: ['critical', 'high', 'medium', 'low'] },
          category: { type: Type.STRING, enum: ['performance', 'security', 'best-practice', 'bug-risk'] },
          description: { type: Type.STRING, description: "A one-sentence description of the issue." },
          file: { type: Type.STRING, description: "The file path where the issue was found." },
          line: { type: Type.NUMBER, description: "The line number of the issue." }
        },
        required: ["severity", "category", "description", "file", "line"]
      }
    }
  },
  required: ["overallScore", "summary", "issues"]
};

export const analyzeProjectHealth = async (project: Project): Promise<ProjectHealthAnalysis | null> => {
    const systemInstruction = "You are an expert code quality analyzer. Your task is to review a multi-platform project, identify potential issues, and provide a health report in JSON format.";

    const codeContext = (Object.keys(project.code) as Platform[]).map(platform => `
      --- START OF ${platform.toUpperCase()} CODE ---
      ${project.code[platform]}
      --- END OF ${platform.toUpperCase()} CODE ---
    `).join('\n\n');

    const prompt = `
      Analyze the following project code and provide a health analysis.
      
      **Project Name:** ${project.name}
      
      **Code:**
      ${codeContext}
      
      **Instructions:**
      1.  Give an \`overallScore\` from 0 (terrible) to 100 (perfect).
      2.  Write a concise \`summary\` of the project's state.
      3.  Identify up to 10 major \`issues\`. For each issue, specify severity, category, description, file (use 'web', 'android', or 'flutter'), and an approximate line number.
      4.  Focus on issues related to performance, security, bug risks, and deviations from best practices.
      5.  Respond ONLY with the JSON object.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: healthAnalysisSchema,
                temperature: 0.3
            }
        });
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        return parsedResponse as ProjectHealthAnalysis;

    } catch (e) {
        console.error("Error analyzing project health with Gemini:", e);
        return null;
    }
};

const markdownLinterSchema = {
    type: Type.ARRAY,
    description: "A list of linting issues found in the markdown file.",
    items: {
        type: Type.OBJECT,
        properties: {
            line: { type: Type.NUMBER, description: "The line number where the issue occurs." },
            message: { type: Type.STRING, description: "A concise description of the issue." },
            severity: { type: Type.STRING, enum: ['error', 'warning', 'info'], description: "The severity of the issue." },
            quickFixTitle: { type: Type.STRING, description: "Optional: A short title for a suggested fix." },
            replacementCode: { type: Type.STRING, description: "Optional: The suggested code to replace the problematic line." },
        },
        required: ["line", "message", "severity"]
    }
};

export const lintMarkdown = async (code: string): Promise<(Omit<Diagnostic, 'id' | 'start' | 'end' | 'source'> & { line: number })[]> => {
    const systemInstruction = "You are an expert markdown linter. Analyze the provided markdown code for issues related to formatting, style, and best practices. Provide your findings as a JSON array.";

    const prompt = `
      Lint the following markdown file. Identify issues such as:
      - Incorrect heading levels (e.g., H1 followed by H3)
      - Long lines (over 80 characters)
      - Mixed list styles (e.g., using '-' and '*' in the same list)
      - Unordered list markers should be consistent (* or -)
      - Provide helpful suggestions for clarity and readability.
      - If possible, provide a \`replacementCode\` for a quick fix.

      **Markdown to Lint:**
      \`\`\`markdown
      ${code}
      \`\`\`

      Respond ONLY with a JSON array matching the schema.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: markdownLinterSchema,
                temperature: 0.2
            }
        });
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        // Map the API response to our Diagnostic type
        return parsed.map((issue: any) => ({
            ...issue,
            severity: issue.severity as DiagnosticSeverity,
        }));

    } catch (e) {
        console.error("Error linting markdown with Gemini:", e);
        return [];
    }
};


export const sendMessageStream = async (chat: Chat, message: string) => {
    return chat.sendMessageStream({ message });
};

export const getCompletion = async (code: string): Promise<string> => {
    const prompt = `
      You are a code completion assistant. Given the following code snippet, provide a likely completion.
      Respond only with the code completion, without any explanation or markdown.
      The completion should be a single line if possible.

      Code:
      \`\`\`
      ${code}
      \`\`\`
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1,
                maxOutputTokens: 30,
            }
        });
        return response.text.split('\n')[0]; // Return first line of completion
    } catch (e) {
        console.error("Error getting code completion:", e);
        return "";
    }
};

export const suggestCommitMessage = async (diffs: string): Promise<string> => {
    const prompt = `
      You are an expert at writing conventional commit messages.
      Based on the following git diff, generate a concise and descriptive commit message.
      The message should follow the conventional commit format (e.g., "feat: add user login").
      Do not include any explanation, just the commit message itself.

      Diffs:
      \`\`\`diff
      ${diffs}
      \`\`\`
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.6,
            }
        });
        return response.text.trim();
    } catch (e) {
        console.error("Error suggesting commit message:", e);
        return "chore: update files";
    }
};