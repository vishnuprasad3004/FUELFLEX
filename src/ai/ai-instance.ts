import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure the API key is being read from the environment variables.
// The user MUST set the GOOGLE_GENAI_API_KEY in their .env file.
const googleApiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!googleApiKey) {
  console.warn(`
    ****************************************************************************************
    * WARNING: GOOGLE_GENAI_API_KEY environment variable not set.                        *
    *                                                                                      *
    * The AI pricing feature requires a Google AI API key.                                 *
    * Please create a .env file in the project root and add the following line:          *
    * GOOGLE_GENAI_API_KEY=YOUR_API_KEY_HERE                                               *
    *                                                                                      *
    * Get your key from Google AI Studio: https://aistudio.google.com/app/apikey         *
    * Or from Google Cloud: https://console.cloud.google.com/apis/credentials             *
    *                                                                                      *
    * The application might fail to estimate prices until the key is provided.           *
    ****************************************************************************************
  `);
}


export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: googleApiKey, // Explicitly pass the key from the environment variable
    }),
  ],
  model: 'googleai/gemini-2.0-flash', // Using gemini-flash as default
  logLevel: 'debug', // Add more detailed logging for debugging
  // flowStateStore: 'firebase', // Configure if using Firebase for state storage
  // traceStore: 'firebase', // Configure if using Firebase for tracing
});
