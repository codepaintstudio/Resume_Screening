import React, { useState } from 'react';
import { Mail, Lock, User, ShieldCheck, ArrowRight, GraduationCap, Github } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthScreenProps {
  onLogin: (user?: any) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [direction, setDirection] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleModeChange = (newMode: 'login' | 'register' | 'forgot') => {
    // Determine direction: login -> others = 1 (right to left), others -> login = -1 (left to right)
    // Register <-> Forgot? Let's treat login as base.
    if (mode === 'login') {
      setDirection(1);
    } else if (newMode === 'login') {
      setDirection(-1);
    } else {
      setDirection(1); // sibling switch
    }
    setMode(newMode);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (data.success) {
          toast.success('登录成功');
          // Store token if provided
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
          }
          onLogin(data.user);
        } else {
          toast.error(data.message || '登录失败');
        }
      } else if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, code })
        });
        const data = await res.json();

        if (data.success) {
          toast.success('注册成功，请登录');
          handleModeChange('login');
        } else {
          toast.error(data.message || '注册失败');
        }
      } else {
        // Mock forgot password
        setTimeout(() => {
            toast.success('重置连接已发送');
            handleModeChange('login');
        }, 800);
      }
    } catch (error) {
      toast.error('请求出错');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/logo-dark.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-black tracking-tight uppercase">CodePrint Studio</span>
          </div>
          
          <div className="space-y-6 max-w-lg relative z-20">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              码绘工作室<br />人才管理系统
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              内部专用的招新管理平台。集成 AI 简历提取、部门流转、面试评价与飞书通知。
            </p>
          </div>
        </div>
        
        {/* Full Width Illustration */}
        <div className="absolute bottom-0 left-12 right-12 z-0 mb-20">
           <img 
             src="/login-illustration.png"
             alt="System Dashboard"
             className="w-full object-cover"
           />
        </div>

        <div className="relative z-20 flex gap-12">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Current Version</p>
            <p className="text-xl font-bold text-white">v2.4.0 Stable</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Security</p>
            <p className="text-xl font-bold text-white">End-to-End</p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-24 bg-white dark:bg-slate-950 overflow-hidden">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div 
            key={mode}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="max-w-md w-full mx-auto"
          >
            <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {mode === 'login' ? '成员登录' : mode === 'register' ? '新成员加入' : '重置凭据'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              请使用工作室分配的内部邮箱访问系统
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">内部邮箱</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="admin@mahui.com"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">访问密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">入职验证码</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                    placeholder="6-Digit Code"
                  />
                  <button type="button" className="px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm">获取</button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-slate-500 font-bold group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">自动登录</span>
                </label>
                <button type="button" onClick={() => handleModeChange('forgot')} className="text-sm text-blue-600 hover:text-blue-700 font-bold">找回密码</button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {mode === 'login' ? '进入系统' : mode === 'register' ? '完成注册' : '确认重置'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {mode === 'login' && (
              <div className="mt-6 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-950 px-2 text-slate-400 font-bold tracking-widest">Or continue with</span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    onLogin();
                    toast.success('GitHub 登录成功');
                  }}
                  className="w-full py-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <button 
                type="button"
                onClick={() => handleModeChange(mode === 'login' ? 'register' : 'login')}
                className="text-slate-400 dark:text-slate-500 text-sm font-bold hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                {mode === 'login' ? '新加入的成员？去注册' : '已有账号？返回登录'}
              </button>
            </div>
          </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
