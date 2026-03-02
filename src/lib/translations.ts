export const translations = {
  en: {
    welcome: "Welcome back",
    startScan: "Start New Scan",
    history: "Scan History",
    analytics: "Usage Insights",
    safe: "Safe to Use",
    expired: "Expired",
    atRisk: "At Risk",
    disposal: "Disposal Guidance",
    authenticity: "Authenticity Check",
    voiceFeedback: "Voice Feedback enabled",
    langName: "English"
  },
  te: {
    welcome: "తిరిగి స్వాగతం",
    startScan: "కొత్త స్కాన్ ప్రారంభించండి",
    history: "స్కాన్ చరిత్ర",
    analytics: "వినియోగ సమాచారం",
    safe: "సురక్షితం",
    expired: "గడువు ముగిసింది",
    atRisk: "ప్రమాదంలో ఉంది",
    disposal: "విసర్జన మార్గదర్శకత్వం",
    authenticity: "ప్రామాణికత తనిఖీ",
    voiceFeedback: "వాయిస్ ఫీడ్‌బ్యాక్ ప్రారంభించబడింది",
    langName: "తెలుగు"
  }
};

export type Language = keyof typeof translations;
