import en from './locales/en.json';
import pl from './locales/pl.json';

const translations = {
  en,
  pl,
};

const lang = navigator.language.slice(0, 2)==="pl" ? "pl" : "en"; // set polish or in any other case english

/**
 * Get a translation for a given key in a specific locale.
 *
 * @param {string} locale - The locale to use for translation.
 * @param {string} key - The translation key to lookup.
 * @throws {Error} Throws an error if the locale or key is unknown.
 * @return {string} The translated value.
 */
export function getTranslation(key: string): string {
  if (!translations.hasOwnProperty(lang)) {
    throw new Error(`Unknown locale: ${lang}`);
  }
  const localeData: Record<string, string> = translations[lang];
  if (!localeData.hasOwnProperty(key)) {
    throw new Error(`Unknown translation key: ${key}`);
  }
  return localeData[key];
}