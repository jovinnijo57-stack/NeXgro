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
    "admin.dashboard": "Dashboard",
    "admin.products": "Products",
    "admin.orders": "Orders",
    "admin.users": "Users",
    "admin.analytics": "Analytics",
    "admin.promotions": "Promotions",
    "admin.banners": "Banners",
    "admin.wallet": "Wallet",
    "admin.chat": "Support Chat",
    "admin.locations": "Locations",
    "admin.coupons": "Coupons",
    "admin.flash_deals": "Flash Deals",
    "admin.reviews": "Reviews",
    "admin.recipes": "Recipes",
    "admin.subscriptions": "Subscriptions",
    "admin.recent_orders": "Recent Orders",
    "admin.total_revenue": "Total Revenue",
    "admin.active_users": "Active Users",
    "profile.active_orders": "Active Orders",
    "profile.order_history": "Order History",
    "profile.savings_rewards": "Savings & Rewards",
    "profile.loyalty_points": "Loyalty Points",
    "profile.wallet_balance": "Wallet Balance",
    "profile.refer_earn": "Refer & Earn",
    "profile.notifications": "Notifications",
    "profile.saved_addresses": "Saved Addresses",
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
    "admin.dashboard": "डैशबोर्ड",
    "admin.products": "उत्पाद",
    "admin.orders": "आदेश",
    "admin.users": "उपयोगकर्ता",
    "admin.analytics": "एनालिटिक्स",
    "admin.promotions": "प्रमोशन",
    "admin.banners": "बैनर",
    "admin.wallet": "वॉलेट",
    "admin.chat": "सपोर्ट चैट",
    "admin.locations": "स्थान",
    "admin.coupons": "कूपन",
    "admin.flash_deals": "फ्लैश डील",
    "admin.reviews": "समीक्षाएं",
    "admin.recipes": "रेसिपी",
    "admin.subscriptions": "सब्सक्रिप्शन",
    "admin.recent_orders": "हाल के आदेश",
    "admin.total_revenue": "कुल राजस्व",
    "admin.active_users": "सक्रिय उपयोगकर्ता",
    "profile.active_orders": "सक्रिय आदेश",
    "profile.order_history": "आदेश इतिहास",
    "profile.savings_rewards": "बचत और पुरस्कार",
    "profile.loyalty_points": "लोयल्टी पॉइंट्स",
    "profile.wallet_balance": "वॉलेट बैलेंस",
    "profile.refer_earn": "रेफर करें और कमाएं",
    "profile.notifications": "सूचनाएं",
    "profile.saved_addresses": "सहेजे गए पते",
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
    "admin.dashboard": "டாஷ்போர்டு",
    "admin.products": "தயாரிப்புகள்",
    "admin.orders": "ஆணைகள்",
    "admin.users": "பயனர்கள்",
    "admin.analytics": "பகுப்பாய்வு",
    "admin.promotions": "விளம்பரங்கள்",
    "admin.banners": "பேனர்கள்",
    "admin.wallet": "வாலட்",
    "admin.chat": "ஆதரவு அரட்டை",
    "admin.locations": "இடங்கள்",
    "admin.coupons": "கூப்பன்கள்",
    "admin.flash_deals": "பிளாஷ் டீல்கள்",
    "admin.reviews": "மதிப்பாய்வுகள்",
    "admin.recipes": "சமையல் குறிப்புகள்",
    "admin.subscriptions": "சந்தாக்கள்",
    "admin.recent_orders": "சமீபத்திய ஆணைகள்",
    "admin.total_revenue": "மொத்த வருவாய்",
    "admin.active_users": "செயலில் உள்ள பயனர்கள்",
    "profile.active_orders": "செயலில் உள்ள ஆணைகள்",
    "profile.order_history": "ஆணை வரலாறு",
    "profile.savings_rewards": "சேமிப்பு மற்றும் வெகுமதிகள்",
    "profile.loyalty_points": "விசுவாச புள்ளிகள்",
    "profile.wallet_balance": "வாலட் இருப்பு",
    "profile.refer_earn": "பரிந்துரைத்து சம்பாதிக்கவும்",
    "profile.notifications": "அறிவிப்புகள்",
    "profile.saved_addresses": "சேமிக்கப்பட்ட முகவரிகள்",
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
