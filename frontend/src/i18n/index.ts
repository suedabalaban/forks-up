import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import trTranslations from './locales/tr.json';

export const resources = {
  en: {
    translation: enTranslations
  },
  tr: {
    translation: trTranslations
  }
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export const changeLanguage = (lang: string) => {
  localStorage.setItem('language', lang);
  i18n.changeLanguage(lang);
};

export default i18n;
