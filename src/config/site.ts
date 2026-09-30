/**
 * Centralized Seller Profile & Contact Configuration
 * Modifying these values automatically updates all Call buttons, WhatsApp buttons,
 * and the Contact page across the entire application.
 */
export const SITE_CONFIG = {
  APP_NAME: "मवेशी बाज़ार | Maveshi Bajar",
  APP_DESCRIPTION: "अच्छे और स्वस्थ गाय, भैंस, पड़वा व पड़िया बिक्री के लिए उपलब्ध",
  SELLER_NAME: "Satish Sahu",
  SELLER_PHONE: "+919628802569",
  // WhatsApp format: digits only with country code without + or dashes
  SELLER_WHATSAPP: "919628802569",
  SELLER_PROFILE_IMAGE: "https://res.cloudinary.com/mdd0kut0/image/upload/v1790671528/profile_pic.jpg",
  SELLER_ADDRESS: "ग्राम - रामपुर, जिला - मेरठ, उत्तर प्रदेश (Meerut, Uttar Pradesh)",
  SELLER_EXPERIENCE: "15+ वर्ष का पशुपालन अनुभव (15+ Years Livestock Experience)",
} as const;

export type SiteConfig = typeof SITE_CONFIG;
