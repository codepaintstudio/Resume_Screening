import React, { useEffect, useState } from 'react';
import { 
  Loader2, 
  AlertCircle, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Badge } from "@/app/components/ui/badge";

interface ResumeData {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: {
    company: string;
    position: string;
    duration: string;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    year: string;
  }[];
}

interface MemberResumeProps {
  url: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberResume({ url, open, onOpenChange }: MemberResumeProps) {
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && url) {
      setLoading(true);
      setError(null);
      setData(null);

      // Simulate network request
      const fetchData = async () => {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(`请求失败: ${res.statusText}`);
          }
          const jsonData = await res.json();
          setData(jsonData);
        } catch (err) {
          console.error('Fetch resume error:', err);
          setError(err instanceof Error ? err.message : '加载失败');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [url, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            成员简历预览
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            {loading 
              ? "正在同步简历数据..." 
              : error 
                ? "数据获取异常" 
                : data 
                  ? `${data.name} · ${data.role} · ${data.location}` 
                  : "查看成员详细履历与项目经验"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-medium text-slate-500">正在获取简历数据...</p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-rose-500 p-6 text-center">
              <AlertCircle className="w-10 h-10" />
              <p className="font-medium">{error}</p>
              <button 
                onClick={() => onOpenChange(false)}
                className="mt-2 text-sm text-slate-500 hover:text-slate-900 underline"
              >
                关闭
              </button>
            </div>
          ) : data ? (
            <ScrollArea className="h-full max-h-[calc(85vh-60px)]">
              <div className="p-8 space-y-8">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{data.name}</h2>
                    <p className="text-lg text-blue-600 font-bold mb-4">{data.role}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        {data.email}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        {data.phone}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {data.location}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <section>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">个人简介</h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {data.summary}
                  </p>
                </section>

                {/* Experience */}
                <section>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    工作经历
                  </h3>
                  <div className="space-y-6">
                    {data.experience.map((exp, index) => (
                      <div key={index} className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-600"></div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                          <h4 className="font-bold text-slate-900 dark:text-white">{exp.company}</h4>
                          <span className="text-xs font-bold text-slate-400 uppercase">{exp.duration}</span>
                        </div>
                        <p className="text-sm font-medium text-blue-600 mb-2">{exp.position}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Education */}
                <section>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    教育背景
                  </h3>
                  <div className="grid gap-4">
                    {data.education.map((edu, index) => (
                      <div key={index} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{edu.school}</h4>
                            <p className="text-sm text-slate-500 mt-1">{edu.degree}</p>
                          </div>
                          <span className="text-xs font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                            {edu.year}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Skills */}
                <section>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">技能专长</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>
              </div>
            </ScrollArea>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
