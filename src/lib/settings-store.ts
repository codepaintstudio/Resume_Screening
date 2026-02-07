
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
  apiKeys: {
    id: string;
    name: string;
    key: string;
    created: string;
    expiresAt?: string;
  }[];
}

let settings: SettingsState = {
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
      endpoint: '',
      model: 'vision-vk-v2',
      apiKey: '',
    },
    llm: {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: '',
    },
  },
  notifications: {
    webhookUrl: '',
    triggers: {
      'new_resume': true,
      'interview_reminder': true,
      'offer_confirmed': true,
    }
  },
  resumeImport: {
    imapServer: 'imap.exmail.qq.com',
    port: '993',
    account: '',
    password: '',
    ssl: true,
  },
  apiKeys: [
    { id: '1', name: 'HR Portal Integration', key: 'sk_live_51M...', created: '2024-02-15' }
  ]
};

export const getSettings = () => settings;

export const updateSettings = (updates: Partial<SettingsState>) => {
  settings = {
    ...settings,
    ...updates,
  };
  
  // Handle nested updates for specific sections if they are passed partially
  // Ideally, the caller should pass the complete section or we handle deep merge here
  // For simplicity in this refactor, we rely on the route handlers to provide the full section or handled partials
  
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
  return settings[section];
};
