import React from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  CheckCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Send
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const dailyData = [
  { name: '01-26', value: 12 },
  { name: '01-27', value: 18 },
  { name: '01-28', value: 24 },
  { name: '01-29', value: 15 },
  { name: '01-30', value: 32 },
  { name: '01-31', value: 28 },
  { name: '02-01', value: 45 },
];

const departmentData = [
  { name: '前端部', value: 45 },
  { name: 'UI部', value: 30 },
  { name: '办公室', value: 20 },
  { name: '运维', value: 15 },
];

const COLORS = ['#2563eb', '#8b5cf6', '#ec4899', '#f97316'];

export function Dashboard() {
  const stats = [
    { label: '收件箱简历', value: '142', change: '+24', icon: FileText, color: 'blue', trend: 'up' },
    { label: '待面试', value: '12', change: '-2', icon: Calendar, color: 'purple', trend: 'down' },
    { label: '本周通过', value: '5', change: '+1', icon: CheckCircle, color: 'emerald', trend: 'up' },
    { label: '当前在线', value: '8', change: 'Live', icon: Users, color: 'orange', trend: 'up' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black tracking-tight">最近投递</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Daily Resume Submissions</p>
            </div>
            <div className="flex gap-2">
              <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
              <span className="text-[10px] font-bold text-slate-400">本周趋势</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', 
                    fontWeight: 700,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#0f172a'
                  }}
                  itemStyle={{ color: '#2563eb' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-black tracking-tight mb-6">简历占比</h3>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white">110</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {departmentData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                <span className="text-slate-500 font-bold flex-1">{item.name}</span>
                <span className="font-black">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black tracking-tight">最新动态</h3>
            <button className="text-xs text-blue-600 font-black uppercase tracking-wider hover:underline">View All</button>
          </div>
          <div className="space-y-5">
            {[
              { user: 'Admin', action: '解析了 5 份新简历', time: '5分钟前', role: '前端部', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
              { user: 'LiHua', action: '将 [张晓] 移入一面', time: '1小时前', role: 'UI部', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
              { user: 'Lark Bot', action: '发送了 12 条面试提醒', time: '3小时前', role: '系统', avatar: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <img src={activity.avatar} className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shadow-sm" alt="" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {activity.user}
                    <span className="text-slate-400 font-medium ml-1"> {activity.action}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{activity.role} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Interviews */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black tracking-tight">即将进行的面试</h3>
            <button className="text-xs text-blue-600 font-black uppercase tracking-wider hover:underline">Schedule</button>
          </div>
          <div className="space-y-4">
            {[
              { student: '张思锐', time: '14:00 Today', dept: '前端部', type: '初试' },
              { student: '周星', time: '10:00 Tomorrow', dept: 'UI部', type: '复试' },
            ].map((interview, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group hover:border-blue-500 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                  <span className="text-[10px] font-black text-blue-600 uppercase">Feb</span>
                  <span className="text-lg font-black leading-none mt-1">02</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black">{interview.student}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{interview.dept} • {interview.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900 dark:text-white">{interview.time}</p>
                  <button className="mt-2 p-1.5 bg-blue-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
