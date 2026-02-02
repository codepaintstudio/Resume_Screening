import React from 'react';
import { CalendarIcon, Upload } from 'lucide-react';
import { zhCN } from 'date-fns/locale';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Calendar } from "@/app/components/ui/calendar";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { DEPARTMENTS } from '@/config/constants';

interface AIScreeningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  screeningDept: string;
  setScreeningDept: (value: string) => void;
  promptConfig: string;
  setPromptConfig: (value: string) => void;
  onStartScreening: () => void;
}

export function AIScreeningDialog({
  open,
  onOpenChange,
  dateRange,
  setDateRange,
  screeningDept,
  setScreeningDept,
  promptConfig,
  setPromptConfig,
  onStartScreening
}: AIScreeningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="font-black tracking-tight">AI 批量筛选</DialogTitle>
          <DialogDescription>
            配置筛选条件，AI 将自动分析符合条件的简历。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date-range" className="text-xs font-black uppercase tracking-widest text-slate-500">
              投递时间范围
            </Label>
            <div className={cn("grid gap-2")}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "yyyy-MM-dd")} -{" "}
                          {format(dateRange.to, "yyyy-MM-dd")}
                        </>
                      ) : (
                        format(dateRange.from, "yyyy-MM-dd")
                      )
                    ) : (
                      <span>选择日期范围</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                    numberOfMonths={2}
                    locale={zhCN}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dept-scope" className="text-xs font-black uppercase tracking-widest text-slate-500">
              部门范围
            </Label>
            <Select value={screeningDept} onValueChange={setScreeningDept}>
              <SelectTrigger id="dept-scope" className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="选择部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有部门</SelectItem>
                {DEPARTMENTS.slice(1).map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prompt-config" className="text-xs font-black uppercase tracking-widest text-slate-500">
              提示词配置 (可选)
            </Label>
            <Textarea
              id="prompt-config"
              placeholder="例如：重点关注有 React 开发经验的候选人..."
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-24 resize-none"
              value={promptConfig}
              onChange={(e) => setPromptConfig(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-bold">取消</Button>
          <Button onClick={onStartScreening} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">开始筛选</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
