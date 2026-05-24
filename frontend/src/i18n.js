import LanguageDetector from "i18next-browser-languagedetector";
import enAdminLayout from "./locales/en/adminLayout.json";
import enCommon from "./locales/en/common.json";
import enLogin from "./locales/en/login.json";
import enPatientNav from "./locales/en/patientNav.json";
import enPatientProfile from "./locales/en/patientProfile.json";
import enRegister from "./locales/en/register.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import kyAdminLayout from "./locales/ky/adminLayout.json";
import kyCommon from "./locales/ky/common.json";
import kyLogin from "./locales/ky/login.json";
import kyPatientNav from "./locales/ky/patientNav.json";
import kyPatientProfile from "./locales/ky/patientProfile.json";
import kyRegister from "./locales/ky/register.json";
import ruAdminLayout from "./locales/ru/adminLayout.json";
import ruCommon from "./locales/ru/common.json";
import ruLogin from "./locales/ru/login.json";
import ruPatientNav from "./locales/ru/patientNav.json";
import ruPatientProfile from "./locales/ru/patientProfile.json";
import ruRegister from "./locales/ru/register.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: {
        common: ruCommon,
        login: ruLogin,
        register: ruRegister,
        adminLayout: ruAdminLayout,
        patientNav: ruPatientNav,
        patientProfile: ruPatientProfile,
      },
      en: {
        common: enCommon,
        login: enLogin,
        register: enRegister,
        adminLayout: enAdminLayout,
        patientNav: enPatientNav,
        patientProfile: enPatientProfile,
      },
      ky: {
        common: kyCommon,
        login: kyLogin,
        register: kyRegister,
        adminLayout: kyAdminLayout,
        patientNav: kyPatientNav,
        patientProfile: kyPatientProfile,
      },
    },
    fallbackLng: "ru",
    supportedLngs: ["ru", "ky", "en"],
    defaultNS: "common",
    ns: ["common", "login", "register", "adminLayout", "patientNav", "patientProfile"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
