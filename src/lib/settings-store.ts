
import { 
  getPlatformSettings, 
  getAiSettings, 
  getNotificationSettings, 
  getGithubSettings, 
  getResumeImportSettings, 
  getEmailConfig,
  getApiKeys,
  createOrUpdatePlatformSettings,
  createOrUpdateAiSettings,
  createOrUpdateNotificationSettings,
  createOrUpdateGithubSettings,
  createOrUpdateResumeImportSettings,
  createOrUpdateEmailConfig
} from '@/lib/db/queries';

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
    authCode: string;
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


// 缓存设置以减少数据库查询
let cachedSettings: SettingsState | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5000; // 5秒缓存

export const getSettings = async (): Promise<SettingsState> => {
  const now = Date.now();
  
  // 如果缓存有效，直接返回缓存
  if (cachedSettings && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedSettings;
  }

  try {
    // 并行获取所有设置
    const [platformSettings, aiSettings, notificationSettings, githubSettings, resumeImportSettings, emailConfig, apiKeys] = await Promise.all([
      getPlatformSettings(),
      getAiSettings(),
      getNotificationSettings(),
      getGithubSettings(),
      getResumeImportSettings(),
      getEmailConfig(),
      getApiKeys()
    ]);

    cachedSettings = {
      personal: {
        avatar: '',
        displayName: '',
        email: '',
        department: ''
      },
      platform: {
        departments: platformSettings?.departments || []
      },
      ai: {
        vision: {
          endpoint: aiSettings?.visionEndpoint || '',
          model: aiSettings?.visionModel || '',
          apiKey: aiSettings?.visionApiKey || ''
        },
        llm: {
          baseUrl: aiSettings?.llmBaseUrl || '',
          apiKey: aiSettings?.llmApiKey || '',
          model: aiSettings?.llmModel || ''
        }
      },
      notifications: {
        webhookUrl: notificationSettings?.webhookUrl || '',
        triggers: {
          new_resume: notificationSettings?.triggerNewResume ?? true,
          interview_reminder: notificationSettings?.triggerInterviewReminder ?? true,
          offer_confirmed: notificationSettings?.triggerOfferConfirmed ?? true
        }
      },
      resumeImport: {
        imapServer: resumeImportSettings?.imapServer || '',
        port: resumeImportSettings?.port || '',
        account: resumeImportSettings?.account || '',
        authCode: resumeImportSettings?.authCode || '',
        ssl: resumeImportSettings?.ssl ?? true
      },
      github: {
        clientId: githubSettings?.clientId || '',
        clientSecret: githubSettings?.clientSecret || '',
        organization: githubSettings?.organization || '',
        personalAccessToken: githubSettings?.personalAccessToken || ''
      },
      emailSending: {
        host: emailConfig?.host || '',
        port: emailConfig?.port || '',
        user: emailConfig?.user || '',
        pass: emailConfig?.pass || ''
      },
      apiKeys: apiKeys || []
    };

    lastFetchTime = now;
    return cachedSettings;
  } catch (error) {
    console.error('Failed to load settings from database:', error);
    throw error;
  }
};

export const updateSettings = async (updates: Partial<SettingsState>): Promise<SettingsState> => {
  try {
    // 更新各个设置到数据库
    if (updates.platform) {
      await createOrUpdatePlatformSettings(updates.platform);
    }
    if (updates.ai) {
      await createOrUpdateAiSettings(updates.ai);
    }
    if (updates.notifications) {
      await createOrUpdateNotificationSettings(updates.notifications);
    }
    if (updates.github) {
      await createOrUpdateGithubSettings(updates.github);
    }
    if (updates.resumeImport) {
      await createOrUpdateResumeImportSettings(updates.resumeImport);
    }
    if (updates.emailSending) {
      await createOrUpdateEmailConfig(updates.emailSending);
    }

    // 清除缓存，强制重新加载
    cachedSettings = null;
    lastFetchTime = 0;

    return await getSettings();
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw error;
  }
};

export const updateSection = async <K extends keyof SettingsState>(section: K, data: Partial<SettingsState[K]>): Promise<SettingsState[section]> => {
  try {
    switch (section) {
      case 'platform':
        await createOrUpdatePlatformSettings(data as any);
        break;
      case 'ai':
        await createOrUpdateAiSettings(data as any);
        break;
      case 'notifications':
        await createOrUpdateNotificationSettings(data as any);
        break;
      case 'github':
        await createOrUpdateGithubSettings(data as any);
        break;
      case 'resumeImport':
        await createOrUpdateResumeImportSettings(data as any);
        break;
      case 'emailSending':
        await createOrUpdateEmailConfig(data as any);
        break;
      default:
        console.warn(`Section ${section} update not implemented`);
    }

    // 清除缓存
    cachedSettings = null;
    lastFetchTime = 0;

    const settings = await getSettings();
    return settings[section];
  } catch (error) {
    console.error(`Failed to update section ${section}:`, error);
    throw error;
  }
};
