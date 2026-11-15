import hljs from 'highlight.js/lib/core';
const languages = {
  typescript: () => import('highlight.js/lib/languages/typescript'),
  javascript: () => import('highlight.js/lib/languages/javascript'),
  css: () => import('highlight.js/lib/languages/css'),
  html: () => import('highlight.js/lib/languages/xml'),
  json: () => import('highlight.js/lib/languages/json'),
  bash: () => import('highlight.js/lib/languages/bash'),
};
const pending = new Map<string, Promise<void>>();
export async function highlight(code: string, language: string): Promise<string | null> {
  const name =
    ({ ts: 'typescript', js: 'javascript', xml: 'html', sh: 'bash' } as Record<string, string>)[
      language
    ] ?? language;
  if (!(name in languages)) return null;
  let ready = pending.get(name);
  if (!ready) {
    const load = languages[name as keyof typeof languages];
    ready = load().then((module) => {
      hljs.registerLanguage(name, module.default);
    });
    pending.set(name, ready);
  }
  try {
    await ready;
    return hljs.highlight(code, { language: name, ignoreIllegals: true }).value;
  } catch {
    pending.delete(name);
    return null;
  }
}
