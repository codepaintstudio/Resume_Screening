'use client';

import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Users, 
  UserPlus, 
  MoreHorizontal, 
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  RefreshCw,
  GitCommit,
  Activity,
  Settings,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Badge } from '@/app/components/ui/badge';

interface Member {
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

export default function GithubPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [organization, setOrganization] = useState('');
  const [configMissing, setConfigMissing] = useState(false);
  
  // Invite State
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/github/members');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch members');
      }
      
      if (Array.isArray(data.members)) {
        setMembers(data.members);
      } else {
        setMembers([]);
      }
      
      if (data.organization) {
        setOrganization(data.organization);
      }
      setConfigMissing(false);
    } catch (error: any) {
      console.error('Fetch members error:', error);
      if (error.message?.includes('configuration missing') || error.message?.includes('GitHub configuration missing')) {
        setConfigMissing(true);
        // Don't toast here, the UI will show the state
      } else {
        toast.error('获取成员列表失败，请检查网络或设置');
      }
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteInput.trim()) return;
    
    setInviting(true);
    // Split by comma, space, or newline and filter empty
    const usernames = inviteInput
      .split(/[\s,]+/)
      .map(u => u.trim())
      .filter(Boolean);

    if (usernames.length === 0) {
      setInviting(false);
      return;
    }

    try {
      const res = await fetch('/api/github/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames })
      });
      
      if (!res.ok) throw new Error('Invite failed');
      
      const data = await res.json();
      
      setMembers([...members, ...data.invited]);
      setInviteInput('');
      setIsInviteDialogOpen(false);
      toast.success(`已成功发送 ${data.invited.length} 个邀请`);
    } catch (error) {
      toast.error('邀请发送失败，请重试');
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Github className="w-8 h-8 text-slate-900 dark:text-slate-100" />
            GitHub 团队管理
          </h1>
          <p className="text-slate-500 mt-1">
            管理 {organization} 组织成员与权限，支持批量邀请
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="h-9"
            onClick={fetchMembers}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-lg shadow-slate-900/10 dark:shadow-none font-bold">
                <UserPlus className="w-4 h-4 mr-2" />
                批量邀请成员
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>批量邀请成员</DialogTitle>
                <DialogDescription>
                  输入 GitHub 用户名，支持批量粘贴（使用逗号、空格或换行分隔）。
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea 
                  placeholder="例如: shadcn, vercel, nextjs..." 
                  className="h-32 font-mono text-sm"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-2">
                  系统将自动向这些用户发送加入 {organization} 的邀请邮件。
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>取消</Button>
                <Button 
                  onClick={handleInvite} 
                  disabled={inviting || !inviteInput.trim()}
                  className="bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                >
                  {inviting ? '发送中...' : '发送邀请'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">Total Members</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{members.length}</div>
          <p className="text-sm text-slate-500 mt-1">现有的团队成员总数</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">Active</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {members.filter(m => m.status === 'active').length}
          </div>
          <p className="text-sm text-slate-500 mt-1">状态正常的活跃成员</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">Pending</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {members.filter(m => m.status === 'invited').length}
          </div>
          <p className="text-sm text-slate-500 mt-1">等待接受邀请的用户</p>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">成员列表</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Active
            <span className="w-2 h-2 rounded-full bg-amber-500 ml-2"></span>
            Pending
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {members.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-4">
                <img 
                  src={member.avatar} 
                  alt={member.username} 
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{member.username}</span>
                    {member.role === 'owner' && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        Owner
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>Joined {member.joinedAt}</span>
                    <span>•</span>
                    <a 
                      href={`https://github.com/${member.username}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="hover:text-blue-500 hover:underline flex items-center gap-1"
                    >
                      View Profile
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-6 mr-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 justify-end">
                      <GitCommit className="w-3.5 h-3.5" />
                      commits
                    </div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {member.contributions?.commits || 0}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 justify-end">
                      <Activity className="w-3.5 h-3.5" />
                      active
                    </div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {member.contributions?.lastActive || 'Never'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {member.status === 'active' ? (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      Invited
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {members.length === 0 && (
            <div className="p-12 text-center">
              {configMissing ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">未配置 GitHub 集成</h3>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                      请前往系统设置配置 GitHub Organization 和 Personal Access Token 以启用团队管理功能。
                    </p>
                  </div>
                  <Link href="/settings">
                    <Button className="mt-2 font-bold">
                      <Settings className="w-4 h-4 mr-2" />
                      前往配置
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-slate-400">
                  暂无成员，请点击右上角邀请成员。
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
