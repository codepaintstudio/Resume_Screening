
export interface GitHubMember {
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

interface GitHubState {
  organization: string;
  members: GitHubMember[];
}

let githubState: GitHubState = {
  organization: 'mahui-studio',
  members: [
    {
      id: '1',
      username: 'shadcn',
      avatar: 'https://github.com/shadcn.png',
      role: 'owner',
      joinedAt: '2024-01-01',
      status: 'active',
      contributions: {
        commits: 128,
        lastActive: '2h ago'
      }
    },
    {
      id: '2',
      username: 'vercel',
      avatar: 'https://github.com/vercel.png',
      role: 'member',
      joinedAt: '2024-01-15',
      status: 'active',
      contributions: {
        commits: 856,
        lastActive: '5m ago'
      }
    }
  ]
};

export function getGitHubState() {
  return githubState;
}

export function addMember(username: string) {
  const newMember: GitHubMember = {
    id: Date.now().toString(),
    username,
    avatar: `https://github.com/${username}.png`,
    role: 'member',
    joinedAt: new Date().toISOString().split('T')[0],
    status: 'invited',
    contributions: {
      commits: 0,
      lastActive: 'Never'
    }
  };
  githubState.members = [...githubState.members, newMember];
  return newMember;
}

export function removeMember(id: string) {
  githubState.members = githubState.members.filter(m => m.id !== id);
}
