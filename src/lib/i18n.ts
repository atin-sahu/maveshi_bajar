import hiMessages from "@/messages/hi.json";
import enMessages from "@/messages/en.json";
import { Locale } from "@/types";

export const messages: Record<Locale, Record<string, unknown>> = {
  hi: hiMessages as Record<string, unknown>,
  en: enMessages as Record<string, unknown>,
};

/**
 * Resolve translation key like "hero.title" or "validation.maxAnimalsExceeded"
 * with interpolation parameter support e.g. { max: 10 }
 */
export function getTranslation(
  locale: Locale,
  path: string,
  params?: Record<string, string | number>
): string {
  const currentMessages = messages[locale] || messages.hi;
  const keys = path.split(".");
  let current: unknown = currentMessages;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      // Fallback to Hindi if missing in current locale
      let fallbackCurrent: unknown = messages.hi;
      for (const fKey of keys) {
        if (fallbackCurrent && typeof fallbackCurrent === "object" && fKey in fallbackCurrent) {
          fallbackCurrent = (fallbackCurrent as Record<string, unknown>)[fKey];
        } else {
          return path;
        }
      }
      current = fallbackCurrent;
      break;
    }
  }

  if (typeof current !== "string") {
    return path;
  }

  let text = current;
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
    });
  }

  return text;
}
