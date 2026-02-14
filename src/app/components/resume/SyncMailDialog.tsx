import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Mail, Loader2, RefreshCw, Check, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";

interface SyncMailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface MailItem {
  uid: number;
  subject: string;
  from: string;
  fromName: string;
  date: string | null;
  body?: string;
}

export function SyncMailDialog({ open, onOpenChange, onSuccess }: SyncMailDialogProps) {
  const [step, setStep] = useState<'config' | 'preview' | 'import'>('config');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  
  // IMAP 配置
  const [imapConfig, setImapConfig] = useState({
    host: 'imap.qq.com',
    port: '993',
    user: '',
    pass: ''
  });
  
  // 邮件列表
  const [mails, setMails] = useState<MailItem[]>([]);
  const [selectedMails, setSelectedMails] = useState<Set<number>>(new Set());
  
  // 加载保存的配置
  useEffect(() => {
    if (open) {
      fetch('/api/settings/resume-import')
        .then(res => res.json())
        .then(data => {
          if (data?.imapServer) {
            setImapConfig(prev => ({
              ...prev,
              host: data.imapServer || prev.host,
              port: data.port || prev.port,
              user: data.account || prev.user,
              pass: '' // 不加载密码
            }));
          }
        })
        .catch(console.error);
    }
  }, [open]);

  // 获取邮件列表
  const fetchMails = async () => {
    if (!imapConfig.host || !imapConfig.user || !imapConfig.pass) {
      setError('请填写完整的 IMAP 配置');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/get-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: imapConfig.host,
          port: Number(imapConfig.port) || 993,
          user: imapConfig.user,
          pass: imapConfig.pass,
          limit: 20,
          saveToDb: true
        })
      });

      const data = await res.json();

      if (data.success) {
        setMails(data.mails || []);
        setSelectedMails(new Set());
        setStep('preview');
        toast.success(`成功获取 ${data.mails?.length || 0} 封邮件`);
      } else {
        setError(data.message || '获取邮件失败');
      }
    } catch (err) {
      setError('连接邮箱服务器失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 导入选中的邮件为简历
  const importSelectedMails = async () => {
    if (selectedMails.size === 0) {
      toast.error('请选择要导入的邮件');
      return;
    }

    setImporting(true);

    try {
      const selectedMailList = mails.filter(m => selectedMails.has(m.uid));
      
      // 将选中的邮件转换为简历数据
      const students = selectedMailList.map(mail => ({
        name: mail.fromName || mail.from.split('@')[0] || '未知',
        studentId: `MAIL${mail.uid}`,
        department: '待定',
        email: mail.from,
        phone: '',
        status: 'pending' as const,
        tags: ['邮箱导入', mail.subject.substring(0, 20)],
        gpa: '0',
      }));

      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`成功导入 ${students.length} 份简历`);
        onSuccess?.();
        handleClose();
      } else {
        throw new Error(data.message || '导入失败');
      }
    } catch (err) {
      toast.error('导入简历失败');
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  // 关闭对话框
  const handleClose = () => {
    setStep('config');
    setMails([]);
    setSelectedMails(new Set());
    setError('');
    onOpenChange(false);
  };

  // 切换邮件选择
  const toggleMail = (uid: number) => {
    const newSelected = new Set(selectedMails);
    if (newSelected.has(uid)) {
      newSelected.delete(uid);
    } else {
      newSelected.add(uid);
    }
    setSelectedMails(newSelected);
  };

  // 全选
  const selectAll = () => {
    if (selectedMails.size === mails.length) {
      setSelectedMails(new Set());
    } else {
      setSelectedMails(new Set(mails.map(m => m.uid)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            从邮箱同步简历
          </DialogTitle>
          <DialogDescription>
            {step === 'config' && '配置 IMAP 服务器连接信息'}
            {step === 'preview' && `找到 ${mails.length} 封邮件，选择要导入的邮件`}
            {step === 'import' && '正在导入...'}
          </DialogDescription>
        </DialogHeader>

        {step === 'config' && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">IMAP 服务器</label>
                <Input
                  value={imapConfig.host}
                  onChange={(e) => setImapConfig({ ...imapConfig, host: e.target.value })}
                  placeholder="imap.qq.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">端口</label>
                <Input
                  value={imapConfig.port}
                  onChange={(e) => setImapConfig({ ...imapConfig, port: e.target.value })}
                  placeholder="993"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">邮箱账号</label>
                <Input
                  value={imapConfig.user}
                  onChange={(e) => setImapConfig({ ...imapConfig, user: e.target.value })}
                  placeholder="hr@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">授权码</label>
                <Input
                  type="password"
                  value={imapConfig.pass}
                  onChange={(e) => setImapConfig({ ...imapConfig, pass: e.target.value })}
                  placeholder="请输入授权码"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="text-xs text-slate-500">
              <p>提示：QQ 邮箱需要使用授权码登录，而非 QQ 密码。</p>
              <p>获取方式：邮箱设置 → 账户 → 开启 IMAP/SMTP服务 → 生成授权码</p>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="flex-1 overflow-hidden flex flex-col py-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500">
                已选择 {selectedMails.size} / {mails.length} 封邮件
              </span>
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedMails.size === mails.length ? '取消全选' : '全选'}
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 max-h-60">
              {mails.map((mail) => (
                <div
                  key={mail.uid}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMails.has(mail.uid)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                  onClick={() => toggleMail(mail.uid)}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    selectedMails.has(mail.uid)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {selectedMails.has(mail.uid) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{mail.subject}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {mail.fromName || mail.from}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {mail.date ? new Date(mail.date).toLocaleDateString('zh-CN') : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'config' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button onClick={fetchMails} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    连接中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    获取邮件
                  </>
                )}
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('config')}>
                上一步
              </Button>
              <Button onClick={importSelectedMails} disabled={importing || selectedMails.size === 0}>
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    导入中...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    导入选中的邮件
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
