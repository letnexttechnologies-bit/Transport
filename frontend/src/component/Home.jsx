import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  const currentLanguage = i18n.language || "en";

  return (
    <div className="role-container">
      <div className="role-card">

        {/* Language Selector */}
        <div className="language-selector">
          <select
            value={currentLanguage}
            onChange={(e) => changeLanguage(e.target.value)}
            className="lang-select"
          >
            <option value="en">{t("languages.en")}</option>
            <option value="hi">{t("languages.hi")}</option>
            <option value="ta">{t("languages.ta")}</option>
            <option value="te">{t("languages.te")}</option>
          </select>
        </div>

        <div className="emoji">🚚</div>

        <h2 className="role-title">{t("title")}</h2>
        <p className="role-subtitle">{t("subtitle")}</p>

        <button
          className="role-btn admin"
          onClick={() => navigate("/admin-login")}
        >
           {t("adminLogin")}
        </button>

        <button
          className="role-btn user"
          onClick={() => navigate("/user-login")}
        >
          {t("userLogin.loginTitle")}
        </button>

      </div>
    </div>
  );
}
