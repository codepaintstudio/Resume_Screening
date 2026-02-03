"use client";

import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorDisplayProps {
  error?: Error | any;
  title?: string;
  message?: string;
  details?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ 
  error,
  title = "出错了", 
  message, 
  details,
  onRetry,
  className = ""
}: ErrorDisplayProps) {
  // Determine content from props or error object
  const displayMessage = message || error?.message || "加载数据时遇到问题，请稍后重试。";
  
  // Extract details: prefer explicit details prop, then error stack, then stringified error
  let displayDetails = details;
  if (!displayDetails && error) {
    if (error instanceof Error && error.stack) {
      displayDetails = error.stack;
    } else if (typeof error === 'object') {
      try {
        displayDetails = JSON.stringify(error, null, 2);
      } catch (e) {
        displayDetails = String(error);
      }
    } else {
      displayDetails = String(error);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 ${className}`}
    >
      <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-rose-500" />
      </div>
      
      <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        {displayMessage}
      </p>

      {displayDetails && (
        <div className="w-full max-w-md bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-8 text-left overflow-auto max-h-40">
           <code className="text-xs font-mono text-rose-500 break-all whitespace-pre-wrap">
             {displayDetails}
           </code>
        </div>
      )}

      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4" />
          重试
        </button>
      )}
    </motion.div>
  );
}
