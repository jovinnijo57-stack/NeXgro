import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "hi" | "ta";

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.browse": "Browse",
    "nav.wishlist": "Wishlist",
    "nav.orders": "My Orders",
    "nav.loyalty": "Loyalty Points",
    "nav.profile": "Profile",
    "nav.signout": "Sign Out",
    "search.placeholder": "Search for products...",
    "profile.admin_tools": "Administrative Tools",
    "profile.admin_dashboard": "Admin Dashboard",
  },
  hi: {
    "nav.home": "होम",
    "nav.browse": "ब्राउज़",
    "nav.wishlist": "विशलिस्ट",
    "nav.orders": "मेरे ऑर्डर",
    "nav.loyalty": "लोयल्टी पॉइंट्स",
    "nav.profile": "प्रोफ़ाइल",
    "nav.signout": "साइन आउट",
    "search.placeholder": "उत्पादों की खोज करें...",
    "profile.admin_tools": "प्रशासनिक उपकरण",
    "profile.admin_dashboard": "एडमिन डैशबोर्ड",
  },
  ta: {
    "nav.home": "முகப்பு",
    "nav.browse": "உலாவு",
    "nav.wishlist": "விருப்பப்பட்டியல்",
    "nav.orders": "எனது ஆணைகள்",
    "nav.loyalty": "விசுவாச புள்ளிகள்",
    "nav.profile": "சுயவிவரம்",
    "nav.signout": "வெளியேறு",
    "search.placeholder": "தயாரிப்புகளைத் தேடுங்கள்...",
    "profile.admin_tools": "நிர்வாக கருவிகள்",
    "profile.admin_dashboard": "நிர்வாக டாஷ்போர்டு",
  }
};

const LanguageContext = createContext<{ language: Language; setLanguage: (l: Language) => void; t: (k: string) => string }>({
  language: "en",
  setLanguage: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
