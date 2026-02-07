import React, { useState, useEffect } from 'react';
import { 
  User, 
  Key, 
  Loader2,
  Save,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

interface PersonalCenterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonalCenterModal({ open, onOpenChange }: PersonalCenterModalProps) {
  const [loading, setLoading] = useState(false);
  const [personal, setPersonal] = useState({
    avatar: '',
    displayName: '',
    email: '',
    department: ''
  });

  // Password change state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (open) {
      fetchProfile();
    }
  }, [open]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/profile');
      const data = await res.json();
      setPersonal(data || {});
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('加载个人资料失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personal)
      });
      
      if (res.ok) {
        toast.success('个人资料已更新');
        onOpenChange(false);
      } else {
        toast.error('保存失败');
      }
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('密码修改成功');
        setIsPasswordDialogOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || '修改失败');
      }
    } catch (error) {
      toast.error('请求失败，请稍后重试');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              个人中心
            </DialogTitle>
            <DialogDescription>
              管理您的个人信息和账号安全设置
            </DialogDescription>
          </DialogHeader>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-sm">
                  <img 
                    src={personal.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
                    className="w-full h-full object-cover" 
                    alt="Avatar" 
                  />
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-blue-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {personal.displayName || 'User'}
                </h4>
                <p className="text-sm text-slate-500 font-medium">
                  {personal.email || 'email@example.com'}
                </p>
                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 mt-1">
                  {personal.department || '未分配部门'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">显示名称</label>
                <input 
                  type="text" 
                  value={personal.displayName} 
                  onChange={(e) => setPersonal({...personal, displayName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">所属部门</label>
                <input 
                  type="text" 
                  value={personal.department} 
                  onChange={(e) => setPersonal({...personal, department: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm" 
                  placeholder="例如：技术部"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">账号安全</label>
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group shadow-sm hover:shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                          <Key className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm text-slate-700 dark:text-slate-200">修改登录密码</p>
                          <p className="text-xs text-slate-400">定期更换密码以保护账号安全</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-500 group-hover:underline">去修改</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>修改密码</DialogTitle>
                      <DialogDescription>
                        请输入当前密码和新密码进行修改。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">当前密码</label>
                        <input 
                          type="password" 
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">新密码</label>
                        <input 
                          type="password" 
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">确认新密码</label>
                        <input 
                          type="password" 
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>取消</Button>
                      <Button onClick={handleChangePassword}>确认修改</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            保存更改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
