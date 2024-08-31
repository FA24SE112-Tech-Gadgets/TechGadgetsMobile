import i18next from "i18next"
import en from "../locales/en.json"
import vi from "../locales/vi.json"
import { initReactI18next } from "react-i18next"

export const languageResources = {
    en: {
        translation: en
    },
    vi: {
        translation: vi
    }
};

i18next.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    lng: 'vi',
    fallbackLng: 'vi',
    resources: languageResources,
});

export default i18next;