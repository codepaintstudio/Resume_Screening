import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const MEMBERS_FILE = path.join(DATA_DIR, 'github-members.json');

export interface Member {
  id: string;
  username: string;
  avatar: string;
  role: 'owner' | 'member' | 'pending';
  joinedAt: string;
  status: 'active' | 'invited';
  contributions: {
    commits: number;
    lastActive: string;
  };
}

const defaultMembers: Member[] = [
  {
    id: '1',
    username: 'shadcn',
    avatar: 'https://github.com/shadcn.png',
    role: 'owner',
    joinedAt: '2023',
    status: 'active',
    contributions: {
      commits: 128,
      lastActive: '2 hours ago'
    }
  },
  {
    id: '2',
    username: 'vercel',
    avatar: 'https://github.com/vercel.png',
    role: 'member',
    joinedAt: '2024',
    status: 'active',
    contributions: {
      commits: 85,
      lastActive: '5 hours ago'
    }
  }
];

let members: Member[] = [];

export const loadMembers = () => {
  try {
    if (fs.existsSync(MEMBERS_FILE)) {
      const data = fs.readFileSync(MEMBERS_FILE, 'utf-8');
      members = JSON.parse(data);
    } else {
      members = [...defaultMembers];
      saveMembers();
    }
  } catch (error) {
    console.error('Failed to load members:', error);
    members = [...defaultMembers];
  }
  return members;
};

export const saveMembers = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save members:', error);
  }
};

export const getMembers = () => {
  if (members.length === 0) {
    loadMembers();
  }
  return members;
};

export const addMembers = (newMembers: Member[]) => {
  if (members.length === 0) {
    loadMembers();
  }
  
  // Filter out duplicates based on username
  const existingUsernames = new Set(members.map(m => m.username.toLowerCase()));
  const uniqueNewMembers = newMembers.filter(m => !existingUsernames.has(m.username.toLowerCase()));
  
  if (uniqueNewMembers.length > 0) {
    members = [...members, ...uniqueNewMembers];
    saveMembers();
  }
  
  return uniqueNewMembers;
};

// Initialize
loadMembers();
