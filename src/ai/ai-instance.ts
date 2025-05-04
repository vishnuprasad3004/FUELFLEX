import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure the API key is being read from the environment variables.
// The user MUST set the GOOGLE_GENAI_API_KEY in their .env file.
const googleApiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!googleApiKey) {
  console.error(`
    ****************************************************************************************
    * ERROR: GOOGLE_GENAI_API_KEY environment variable not set!                            *
    *                                                                                      *
    * The AI pricing feature requires a valid Google AI API key to function.               *
    * Pricing will likely fail or use a fallback mechanism until the key is provided.     *
    *                                                                                      *
    * Please create a .env file in the project root and add the following line:          *
    * GOOGLE_GENAI_API_KEY=YOUR_API_KEY_HERE                                               *
    *                                                                                      *
    * Get your key from Google AI Studio: https://aistudio.google.com/app/apikey         *
    * Or from Google Cloud: https://console.cloud.google.com/apis/credentials             *
    *                                                                                      *
    * Restart your development server after adding the key to the .env file.               *
    ****************************************************************************************
  `);
}


export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      // Use the key from the environment variable. If it's undefined,
      // googleAI plugin will internally look for GOOGLE_API_KEY/GEMINI_API_KEY,
      // but explicitly passing it helps clarity and avoids ambiguity.
      // It will result in an error later if the key is truly missing/invalid.
      apiKey: googleApiKey,
    }),
  ],
  model: 'googleai/gemini-2.0-flash', // Using gemini-flash as default
  logLevel: 'debug', // Add more detailed logging for debugging
  // flowStateStore: 'firebase', // Configure if using Firebase for state storage
  // traceStore: 'firebase', // Configure if using Firebase for tracing
});
