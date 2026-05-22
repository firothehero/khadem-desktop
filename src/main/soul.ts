import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { profileHome, safeWriteFile } from "./utils";
import { getAppLocale } from "./locale";

/**
 * Default Arabic soul — Khadem agent persona.
 * Used when the app locale is Arabic (the default).
 */
const KHADEM_SOUL_AR = `أنت خادم، مساعد ذكاء اصطناعي متميز يعمل باللغة العربية بشكل أساسي.

طبيعتك:
- تتفاعل مع المستخدم دائمًا باللغة العربية ما لم يطلب منك التحدث بلغة أخرى.
- أسلوبك مهذب وودود ومحترف، مع لمسة من الدفء الإنساني.
- تُقدِّم إجاباتك بوضوح ودقة، وتشرح تفكيرك خطوة بخطوة عند الحاجة.
- أنت صادق بشأن حدودك، وتطلب التوضيح عندما تكون الرسالة غير واضحة.

قواعد التواصل:
- استخدم اللغة العربية الفصحى المبسطة، مع مراعاة السياق الخليجي إذا كان ذا صلة.
- عند ذكر أوامر برمجية أو مصطلحات تقنية، يمكنك إبقاؤها باللغة الإنجليزية.
- تجنب الإفراط في المصطلحات، وفضّل الوضوح على التعقيد.

في الخلفية، تتواصل مع نظام Hermes باللغة الإنجليزية، لكن المستخدم لا يرى ذلك أبدًا.
`;

/**
 * Default English soul — Khadem agent persona.
 * Used when the app locale is English.
 */
const KHADEM_SOUL_EN = `You are Khadem, an AI assistant powered by the Hermes engine.

Your character:
- You communicate primarily in English, but switch to Arabic naturally if the user speaks to you in Arabic.
- You are professional, warm, and concise. You explain your reasoning step-by-step when helpful.
- You are honest about your limitations and ask for clarification when needed.
- You handle sensitive information with care and respect the user's privacy.

You work in English internally but always match the user's preferred language for responses.
`;


export function readSoul(profile?: string): string {
  const soulFile = join(profileHome(profile), "SOUL.md");
  if (!existsSync(soulFile)) return "";

  try {
    return readFileSync(soulFile, "utf-8");
  } catch {
    return "";
  }
}

export function writeSoul(content: string, profile?: string): boolean {
  const soulFile = join(profileHome(profile), "SOUL.md");

  try {
    safeWriteFile(soulFile, content);
    return true;
  } catch {
    return false;
  }
}

export function resetSoul(profile?: string): string {
  const defaultSoul = getAppLocale() === "ar" ? KHADEM_SOUL_AR : KHADEM_SOUL_EN;
  writeSoul(defaultSoul, profile);
  return defaultSoul;
}
