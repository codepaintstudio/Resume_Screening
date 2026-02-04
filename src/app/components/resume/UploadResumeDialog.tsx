import React, { useState, useCallback, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[]) => void;
}

export function UploadResumeDialog({
  open,
  onOpenChange,
  onUpload
}: UploadResumeDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/msword' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    if (validFiles.length !== droppedFiles.length) {
      toast.error('部分文件格式不支持，仅支持 PDF 和 Word 文档');
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    onUpload(files);
    setFiles([]);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>上传简历</DialogTitle>
          <DialogDescription>
            支持拖拽上传，支持 PDF、Word 格式，单个文件不超过 10MB
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200",
              isDragging 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                : "border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors",
              isDragging ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
            )}>
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              点击或拖拽文件到此处
            </p>
            <p className="text-xs text-slate-400">
              支持 PDF, DOC, DOCX
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                <span>待上传文件 ({files.length})</span>
                <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => setFiles([])}>
                  清空全部
                </span>
              </div>
              {files.map((file, index) => (
                <div 
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                      <FileText className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">
            取消
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={files.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
          >
            确认上传 ({files.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
