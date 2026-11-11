// Values used across the site. Change them here, once.

// The Apps Script web app behind every form (see waitlist/apps-script.gs). After deploying a new
// web app (not a new version of the same one), paste its /exec address here.
export const FORMS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz-9hOzXLragpCbln-n2aJJEUMvNya6DIM3TiQs54R7eeWS-KLVWMUkOL7tVIFCGWSX/exec';

// The assistants customers can add Gentifi to today. Keep in step with gentifi-toolkit/src/lib/apps.js,
// and with the step-by-step instructions on /connector and the demo shop page.
export const apps = ['Claude', 'ChatGPT', 'Gemini', 'Grok'];

const list = (word: string) => `${apps.slice(0, -1).join(', ')} ${word} ${apps[apps.length - 1]}`;
/** "Claude, ChatGPT, Gemini and Grok" */
export const appsAnd = list('and');
/** "Claude, ChatGPT, Gemini or Grok" */
export const appsOr = list('or');
