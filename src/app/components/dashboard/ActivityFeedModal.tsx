import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { ActivityItem } from './ActivityItem';
import { Loader2 } from 'lucide-react';

interface ActivityFeedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityFeedModal({ open, onOpenChange }: ActivityFeedModalProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    if (open) {
      // Reset when opening
      setActivities([]);
      setPage(1);
      setHasMore(true);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/activities?page=${page}&limit=10`);
        const data = await res.json();
        
        if (page === 1) {
            setActivities(data.data);
        } else {
            setActivities(prev => [...prev, ...data.data]);
        }
        setHasMore(data.hasMore);
      } catch (error) {
        console.error('Failed to load activities', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [page, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[80vh] flex flex-col p-0 gap-0 bg-white dark:bg-slate-900">
        <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle>全部动态</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
            {activities.map((activity, index) => {
                if (activities.length === index + 1) {
                    return <div ref={lastElementRef} key={`${activity.id}-${index}`}><ActivityItem {...activity} /></div>
                } else {
                    return <ActivityItem key={`${activity.id}-${index}`} {...activity} />
                }
            })}
            {loading && (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
            )}
            {!hasMore && activities.length > 0 && (
                <p className="text-center text-xs text-slate-400 py-4">没有更多动态了</p>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
