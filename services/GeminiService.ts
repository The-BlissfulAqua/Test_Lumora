import { Alert } from '../types';

// Define the interface for the Gemini AI class instance to maintain type safety
// without needing to resolve the module at build time.
interface GenAI {
  models: {
    generateContent(params: {
      model: string;
      contents: string;
    }): Promise<{ text: string }>;
  };
}

// Define the constructor type for the GoogleGenAI class.
type GoogleGenAIConstructor = new (config: { apiKey: string }) => GenAI;

let ai: GenAI | null = null;
let isInitializing = false;
let apiKeyIsConfigured = false;

// CRASH-PROOF API KEY CHECK:
// This function safely checks for the process.env.API_KEY.
// It is designed to run in a browser environment where 'process' does not exist
// without throwing a fatal ReferenceError.
const checkApiKey = () => {
  try {
    // This will only be true in a Node.js-like environment.
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // In a browser, import.meta.env might be available via a build tool.
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.API_KEY) {
        return (import.meta as any).env.API_KEY;
    }
  } catch (error) {
    console.error("Error checking for API key:", error);
  }
  return null;
};

const apiKey = checkApiKey();
if (apiKey) {
    apiKeyIsConfigured = true;
} else {
    console.warn("Gemini API key not found. AI features will be disabled.");
    apiKeyIsConfigured = false;
}

export const isApiKeyConfigured = apiKeyIsConfigured;

// LAZY-LOAD & INITIALIZE THE AI CLIENT
// This prevents the SDK from loading on page start, which was the cause of the crash.
const getAiInstance = async (): Promise<GenAI | null> => {
  if (!apiKeyIsConfigured) return null;
  if (ai) return ai;

  if (isInitializing) {
    // Wait for the in-progress initialization to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    return ai;
  }

  isInitializing = true;
  try {
    // Dynamically import the SDK using the full CDN URL to resolve Vite's issue.
    const genaiModule = await import('https://aistudiocdn.com/google-genai-sdk@0.0.3');
    const GoogleGenAI: GoogleGenAIConstructor = genaiModule.GoogleGenAI;
    
    if (!GoogleGenAI) {
        throw new Error("GoogleGenAI class not found in the imported module.");
    }
    
    ai = new GoogleGenAI({ apiKey: apiKey as string });
    return ai;
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    return null;
  } finally {
    isInitializing = false;
  }
};


const generateContentWithFallback = async (prompt: string, fallbackMessage: string): Promise<string> => {
  const localAi = await getAiInstance();
  if (!localAi) {
    return fallbackMessage;
  }
  try {
    const response = await localAi.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Could not get a response from the AI model. Please check the console for details.";
  }
};

export const GeminiService = {
  async generateThreatAssessment(alerts: Alert[]): Promise<string> {
    const fallback = "AI Service Not Configured: Threat assessment is unavailable.";
    if (!isApiKeyConfigured) return fallback;
    if (alerts.length === 0) {
      return "No incidents selected. Please select one or more incidents to generate a threat assessment.";
    }
    const prompt = `
      Analyze the following border security incidents and provide a brief, actionable threat assessment.
      Focus on potential connections, escalation risks, and recommended priority. Be concise.

      Incidents:
      ${alerts.map(a => `- Title: ${a.title}\n  Location: ${a.location}\n  Severity: ${a.level}\n  Timestamp: ${a.timestamp}`).join('\n\n')}
    `;
    return generateContentWithFallback(prompt, fallback);
  },

  async explainAlert(alert: Alert): Promise<string> {
    const fallback = "AI Service Not Configured: Alert explanation is unavailable.";
    if (!isApiKeyConfigured) return fallback;
    const prompt = `
      Explain the following security alert in simple terms for a command officer.
      What are the potential implications and what is the immediate operational context? Be brief and clear.

      Alert Details:
      - Title: ${alert.title}
      - Severity: ${alert.level}
      - Location: ${alert.location}
      - Timestamp: ${alert.timestamp}
    `;
    return generateContentWithFallback(prompt, fallback);
  },

  async summarizeEvidence(alert: Alert): Promise<string> {
    const fallback = "AI Service Not Configured: Mission summary is unavailable.";
    if (!isApiKeyConfigured) return fallback;
    const hasEvidence = alert.evidence.length > 0;
    const hasLogs = alert.dispatchLog.length > 0;

    if (!hasEvidence && !hasLogs) {
        return "No dispatch logs or evidence available to summarize for this mission.";
    }

    const prompt = `
      Summarize the mission activity for a field agent's report based on the following dispatch log and evidence list.
      Provide a brief, neutral summary of events.

      Mission: ${alert.title} at ${alert.location}

      Dispatch Log:
      ${hasLogs ? alert.dispatchLog.map(msg => `- [${msg.sender}] ${msg.text}`).join('\n') : "No dispatch messages."}

      Evidence Log:
      ${hasEvidence ? alert.evidence.map(ev => `- File: ${ev.fileName}`).join('\n') : "No evidence uploaded."}
    `;
    return generateContentWithFallback(prompt, fallback);
  },
};
