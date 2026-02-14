
import fs from 'fs';
import path from 'path';

// 敏感配置从环境变量读取
const getEnvOrDefault = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

// In-memory store for settings
// In a real application, this would be a database or a file-based store
// For this demo, we keep it in memory but separated from the route handlers
// to ensure consistency across different endpoints if needed.

export interface SettingsState {
  personal: {
    avatar: string;
    displayName: string;
    email: string;
    department: string;
  };
  platform: {
    departments: string[];
  };
  ai: {
    vision: {
      endpoint: string;
      model: string;
      apiKey: string;
    };
    llm: {
      baseUrl: string;
      apiKey: string;
      model: string;
    };
  };
  notifications: {
    webhookUrl: string;
    triggers: {
      new_resume: boolean;
      interview_reminder: boolean;
      offer_confirmed: boolean;
    };
  };
  resumeImport: {
    imapServer: string;
    port: string;
    account: string;
    password: string;
    ssl?: boolean;
  };
  github: {
    clientId: string;
    clientSecret: string;
    organization: string;
    personalAccessToken: string;
  };
  emailSending: {
    host: string;
    port: string;
    user: string;
    pass: string;
  };
  apiKeys: {
    id: string;
    name: string;
    key: string;
    created: string;
    expiresAt?: string;
  }[];
}

const defaultSettings: SettingsState = {
  personal: {
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    displayName: '张老师',
    email: 'admin@mahui.com',
    department: '技术部',
  },
  platform: {
    departments: ['前端部', 'UI部', '办公室', '运维'],
  },
  ai: {
    vision: {
      endpoint: getEnvOrDefault('VISION_ENDPOINT', ''),
      model: 'vision-vk-v2',
      apiKey: getEnvOrDefault('VISION_API_KEY', ''),
    },
    llm: {
      baseUrl: getEnvOrDefault('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
      apiKey: getEnvOrDefault('OPENAI_API_KEY', ''),
      model: '',
    },
  },
  notifications: {
    webhookUrl: '',
    triggers: {
      'new_resume': true,
      'interview_reminder': true,
      'offer_confirmed': true
    }
  },
  resumeImport: {
    imapServer: getEnvOrDefault('IMAP_HOST', 'imap.exmail.qq.com'),
    port: getEnvOrDefault('IMAP_PORT', '993'),
    account: getEnvOrDefault('IMAP_USER', ''),
    password: getEnvOrDefault('IMAP_PASS', ''),
    ssl: true,
  },
  github: {
    clientId: getEnvOrDefault('GITHUB_CLIENT_ID', ''),
    clientSecret: getEnvOrDefault('GITHUB_CLIENT_SECRET', ''),
    organization: 'mahui-studio',
    personalAccessToken: '',
  },
  emailSending: {
    host: getEnvOrDefault('SMTP_HOST', 'smtp.example.com'),
    port: getEnvOrDefault('SMTP_PORT', '465'),
    user: getEnvOrDefault('SMTP_USER', ''),
    pass: getEnvOrDefault('SMTP_PASS', ''),
  },
  apiKeys: []
};

let settings: SettingsState = { ...defaultSettings };

// Simple file-based persistence
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const loadSettings = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const loaded = JSON.parse(data);
      // Deep merge with defaults to ensure new fields are present
      settings = {
        ...defaultSettings,
        ...loaded,
        // Ensure nested objects are merged correctly
        personal: { ...defaultSettings.personal, ...loaded.personal },
        platform: { ...defaultSettings.platform, ...loaded.platform },
        ai: { 
            ...defaultSettings.ai, 
            ...loaded.ai,
            vision: { ...defaultSettings.ai.vision, ...loaded.ai?.vision },
            llm: { ...defaultSettings.ai.llm, ...loaded.ai?.llm }
        },
        notifications: { 
            ...defaultSettings.notifications, 
            ...loaded.notifications,
            triggers: { ...defaultSettings.notifications.triggers, ...loaded.notifications?.triggers }
        },
        resumeImport: { ...defaultSettings.resumeImport, ...loaded.resumeImport },
        github: { ...defaultSettings.github, ...loaded.github },
        emailSending: { ...defaultSettings.emailSending, ...loaded.emailSending },
        apiKeys: loaded.apiKeys || defaultSettings.apiKeys
      };
      console.log('Settings loaded from', SETTINGS_FILE);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
};

const saveSettings = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    console.log('Settings saved to', SETTINGS_FILE);
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

// Load initially
loadSettings();

export const getSettings = () => settings;

export const updateSettings = (updates: Partial<SettingsState>) => {
  settings = {
    ...settings,
    ...updates,
  };
  
  saveSettings();
  
  return settings;
};

export const updateSection = <K extends keyof SettingsState>(section: K, data: Partial<SettingsState[K]>) => {
  if (section === 'ai') {
     // Special deep merge for AI
     const currentAi = settings.ai;
     const newAi = data as Partial<SettingsState['ai']>;
     settings.ai = {
         ...currentAi,
         ...newAi,
         vision: { ...currentAi.vision, ...(newAi.vision || {}) },
         llm: { ...currentAi.llm, ...(newAi.llm || {}) }
     };
  } else if (Array.isArray(settings[section])) {
      // For arrays like apiKeys, platform.departments (though platform is obj)
      // If it's the section itself (e.g. apiKeys), replace it
      settings[section] = data as any;
  } else if (typeof settings[section] === 'object' && settings[section] !== null) {
      settings[section] = {
          ...settings[section],
          ...data
      } as any;
  } else {
      settings[section] = data as any;
  }
  
  saveSettings();
  
  return settings[section];
};
