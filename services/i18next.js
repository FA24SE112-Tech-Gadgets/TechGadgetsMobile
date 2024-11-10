import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import vi from "../locales/vi.json";

// Khởi tạo tài nguyên ngôn ngữ
const languageResources = {
    en: {
        translation: en
    },
    vi: {
        translation: vi
    }
};

// Cấu hình `i18next`
i18next
    .use(initReactI18next) // Khởi tạo react-i18next với i18next instance
    .init({
        resources: languageResources,
        lng: "vi", // Ngôn ngữ mặc định
        fallbackLng: "vi",
        compatibilityJSON: "v3", // Đảm bảo sử dụng định dạng JSON tương thích
        interpolation: {
            escapeValue: false // React đã tự động chống XSS
        }
    });

export default i18next;