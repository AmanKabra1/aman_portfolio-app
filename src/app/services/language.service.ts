import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private currentLanguage = signal<Language>(this.getInitialLanguage());

  private translations: Translations = {
    en: {
      // Header & Navigation
      about: 'About',
      skills: 'Skills',
      projects: 'Projects',
      experience: 'Experience',
      contact: 'Contact',

      // Hero Section
      frontendDeveloper: 'Frontend Developer',
      heroTitle: 'Building Scalable & User-Centric Web Applications',
      heroDescription:
        "I'm a passionate frontend engineer specializing in Angular, Node.js, and MySQL. I create beautiful, performant, and accessible web experiences that make a difference.",
      viewProjects: 'View My Projects',
      getInTouch: 'Get in Touch',

      // About Section
      aboutTitle: 'About Me',
      aboutDescription1:
        'I\'m a dedicated frontend engineer with 2+ years of professional experience building modern, scalable web applications. My passion lies in creating beautiful interfaces that are not only visually appealing but also highly performant and accessible.',
      aboutDescription2:
        'I specialize in Angular for frontend development, Node.js & Express for backend services, and MySQL for database management.',
      aboutDescription3:
        "When I'm not coding, you can find me exploring new UI/UX trends, contributing to open-source projects, or sharing knowledge with the developer community.",

      // Stats
      yearsExperience: 'Years of Experience',
      projectsCompleted: 'Projects Completed',
      happyClients: 'Happy Clients',
      dedication: 'Dedication to Quality',

      // Skills Section
      skillsTitle: 'Skills & Expertise',
      frontendDevelopment: 'Frontend Development',
      backendDevelopment: 'Backend Development',
      databases: 'Databases',
      toolsPlatforms: 'Tools & Platforms',

      // Projects Section
      projectsTitle: 'Featured Projects',
      projectsDescription:
        'Here are some of my most recent and exciting projects. Each one showcases different technologies and problem-solving approaches.',
      liveDemo: 'Live Demo',
      viewCode: 'Code',
      viewAll: 'View All Projects',
      showLess: 'Show Less',

      // Experience Section
      experienceTitle: 'Experience',

      // Contact Section
      contactTitle: 'Get In Touch',
      letConnect: "Let's Connect",
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      followMe: 'Follow Me',
      contactForm: 'Contact Form',
      name: 'Name',
      yourName: 'Your name',
      emailLabel: 'Email',
      yourEmail: 'Your email',
      message: 'Message',
      messageLabel: 'Message',
      yourMessage: 'Your message',
      sendMessage: 'Send Message',
      messageSent: 'Message sent successfully! I\'ll get back to you soon.',

      // Footer
      allRights: 'All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      resume: 'Download Resume',
      builtWith: 'Built with Angular & Tailwind CSS',
    },
    hi: {
      // Header & Navigation
      about: 'परिचय',
      skills: 'कौशल',
      projects: 'परियोजनाएं',
      experience: 'अनुभव',
      contact: 'संपर्क',

      // Hero Section
      frontendDeveloper: 'फ्रंटएंड डेवलपर',
      heroTitle: 'स्केलेबल और यूजर-सेंट्रिक वेब एप्लिकेशन बनाना',
      heroDescription:
        'मैं Angular, Node.js, और MySQL में विशेषज्ञता रखने वाला एक प्रबुद्ध फ्रंटएंड इंजीनियर हूं। मैं सुंदर, कुशल और सुलभ वेब अनुभव बनाता हूं।',
      viewProjects: 'मेरी परियोजनाएं देखें',
      getInTouch: 'मुझसे संपर्क करें',

      // About Section
      aboutTitle: 'मेरे बारे में',
      aboutDescription1:
        'मैं आधुनिक, स्केलेबल वेब एप्लिकेशन बनाने में 2+ वर्षों का व्यावहारिक अनुभव रखने वाला एक समर्पित फ्रंटएंड इंजीनियर हूं।',
      aboutDescription2:
        'मैं फ्रंटएंड विकास के लिए Angular, बैकएंड सेवाओं के लिए Node.js और Express, और डेटाबेस प्रबंधन के लिए MySQL में माहिर हूं।',
      aboutDescription3:
        'जब मैं कोड नहीं कर रहा हूं, तो आप मुझे नई UI/UX ट्रेंड्स की खोज करते, ओपन-सोर्स प्रोजेक्ट्स में योगदान करते, या डेवलपर समुदाय के साथ ज्ञान साझा करते देख सकते हैं।',

      // Stats
      yearsExperience: 'वर्षों का अनुभव',
      projectsCompleted: 'पूर्ण परियोजनाएं',
      happyClients: 'खुश क्लाइंट्स',
      dedication: 'गुणवत्ता के प्रति समर्पण',

      // Skills Section
      skillsTitle: 'कौशल और विशेषज्ञता',
      frontendDevelopment: 'फ्रंटएंड विकास',
      backendDevelopment: 'बैकएंड विकास',
      databases: 'डेटाबेस',
      toolsPlatforms: 'उपकरण और प्लेटफॉर्म',

      // Projects Section
      projectsTitle: 'विशेष परियोजनाएं',
      projectsDescription:
        'यहां मेरी सबसे हालिया और रोचक परियोजनाएं हैं। प्रत्येक विभिन्न तकनीकों और समस्या-समाधान दृष्टिकोणों को प्रदर्शित करता है।',
      liveDemo: 'लाइव डेमो',
      viewCode: 'कोड',
      viewAll: 'सभी परियोजनाएं देखें',
      showLess: 'कम दिखाएं',

      // Experience Section
      experienceTitle: 'अनुभव',

      // Contact Section
      contactTitle: 'संपर्क में रहें',
      letConnect: 'आइए जुड़ें',
      email: 'ईमेल',
      phone: 'फोन',
      location: 'स्थान',
      followMe: 'मुझे फॉलो करें',
      contactForm: 'संपर्क फॉर्म',
      name: 'नाम',
      yourName: 'आपका नाम',
      emailLabel: 'ईमेल',
      yourEmail: 'आपका ईमेल',
      message: 'संदेश',
      messageLabel: 'संदेश',
      yourMessage: 'आपका संदेश',
      sendMessage: 'संदेश भेजें',
      messageSent: 'संदेश सफलतापूर्वक भेजा गया! मैं जल्द ही आपसे संपर्क करूंगा।',

      // Footer
      allRights: 'सर्वाधिकार सुरक्षित।',
      privacy: 'गोपनीयता नीति',
      terms: 'सेवा की शर्तें',
      resume: 'रिज्यूमे डाउनलोड करें',
      builtWith: 'Angular और Tailwind CSS से बनाया गया',
    },
  };

  private getInitialLanguage(): Language {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      if (saved && (saved === 'en' || saved === 'hi')) {
        return saved;
      }
      // Default to English
      localStorage.setItem('language', 'en');
    }
    return 'en';
  }

  getLanguage = () => this.currentLanguage;

  setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  }

  translate(key: string): string {
    const lang = this.currentLanguage();
    return this.translations[lang]?.[key] || this.translations['en']?.[key] || key;
  }

  toggleLanguage(): void {
    const newLang = this.currentLanguage() === 'en' ? 'hi' : 'en';
    this.setLanguage(newLang);
  }
}
