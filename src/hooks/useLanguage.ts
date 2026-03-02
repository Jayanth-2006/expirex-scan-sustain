import { useState, useEffect } from 'react';
import { translations, Language } from '@/lib/translations';

export function useLanguage() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('expirex_lang') as Language) || 'en';
  });

  const toggleLang = () => {
    const next = lang === 'en' ? 'te' : 'en';
    setLang(next);
    localStorage.setItem('expirex_lang', next);
  };

  const t = translations[lang];

  return { lang, toggleLang, t };
}
