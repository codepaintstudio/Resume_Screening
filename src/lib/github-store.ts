
// GitHub Members store - 使用内存存储
// 成员数据从 GitHub API 获取，不需要持久化

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

// 内存中的成员列表
let members: Member[] = [];

export const getMembers = (): Member[] => {
  return [...members];
};

export const setMembers = (newMembers: Member[]): void => {
  members = newMembers;
};

export const addMembers = (newMembers: Member[]): Member[] => {
  // 根据 username 去重
  const existingUsernames = new Set(members.map(m => m.username.toLowerCase()));
  const uniqueNewMembers = newMembers.filter(m => !existingUsernames.has(m.username.toLowerCase()));
  
  if (uniqueNewMembers.length > 0) {
    members = [...members, ...uniqueNewMembers];
  }
  
  return uniqueNewMembers;
};

export const clearMembers = (): void => {
  members = [];
};
