import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translations from './translations';

i18n
  .use(initReactI18next)
  .init({
    resources: translations,
    lng: 'en',           // 초기 언어 설정 (필요시 AsyncStorage 등으로 동적 설정 가능)
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React는 XSS 방어가 되어 있으므로 escape 하지 않아도 됩니다.
    },
  });

export default i18n;
