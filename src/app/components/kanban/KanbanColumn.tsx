import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Stage, InterviewTask } from '@/types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  stage: { id: Stage; label: string; color: string };
  tasks: InterviewTask[];
  onTaskClick: (task: InterviewTask) => void;
}

/**
 * 拖拽自动滚动配置
 */
const DRAG_SCROLL_CONFIG = {
  // 检测区域高度（像素）
  DETECTION_ZONE_HEIGHT: 50,
  // 每次滚动的距离（像素）
  SCROLL_AMOUNT: 10,
  // 滚动间隔（毫秒）
  SCROLL_INTERVAL: 50,
} as const;

export function KanbanColumn({ stage, tasks, onTaskClick }: KanbanColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastDragEventTimeRef = useRef<number>(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkScroll = useCallback(() => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop + clientHeight < scrollHeight - 1);

      const progress = scrollHeight > clientHeight
        ? scrollTop / (scrollHeight - clientHeight)
        : 0;
      setScrollProgress(progress);
    }
  }, []);

  useEffect(() => {
    checkScroll();

    const resizeObserver = new ResizeObserver(() => checkScroll());
    if (listRef.current) {
      resizeObserver.observe(listRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [tasks, checkScroll]);

  const handleScroll = () => {
    checkScroll();
  };

  const scroll = useCallback((direction: 'up' | 'down') => {
    if (listRef.current) {
      const { clientHeight } = listRef.current;
      const scrollDistance = clientHeight * 0.6;
      const scrollAmount = direction === 'up' ? -scrollDistance : scrollDistance;

      listRef.current.scrollBy({
        top: scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  /**
   * 停止自动滚动
   */
  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  /**
   * 启动自动滚动
   */
  const startAutoScroll = useCallback((direction: 'up' | 'down') => {
    // 如果已经在滚动，直接返回
    if (scrollIntervalRef.current) {
      return;
    }

    if (!listRef.current) return;

    scrollIntervalRef.current = setInterval(() => {
      if (!listRef.current) {
        stopAutoScroll();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = listRef.current;

      // 防止越界
      if (direction === 'up' && scrollTop <= 0) {
        stopAutoScroll();
        return;
      }
      if (direction === 'down' && scrollTop + clientHeight >= scrollHeight) {
        stopAutoScroll();
        return;
      }

      const scrollAmount =
        direction === 'up'
          ? -DRAG_SCROLL_CONFIG.SCROLL_AMOUNT
          : DRAG_SCROLL_CONFIG.SCROLL_AMOUNT;

      listRef.current.scrollBy({ top: scrollAmount });
    }, DRAG_SCROLL_CONFIG.SCROLL_INTERVAL);
  }, [stopAutoScroll]);

  /**
   * 检查是否在检测区域内
   */
  const checkDetectionZone = useCallback((clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const distanceFromTop = clientY - rect.top;
    const distanceFromBottom = rect.bottom - clientY;

    // 在顶部检测区域
    if (distanceFromTop < DRAG_SCROLL_CONFIG.DETECTION_ZONE_HEIGHT && distanceFromTop >= 0) {
      startAutoScroll('up');
      return;
    }

    // 在底部检测区域
    if (distanceFromBottom < DRAG_SCROLL_CONFIG.DETECTION_ZONE_HEIGHT && distanceFromBottom >= 0) {
      startAutoScroll('down');
      return;
    }

    // 不在检测区域，停止滚动
    stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  /**
   * 处理拖拽进入
   */
  const handleDragEnter = () => {
    isDraggingRef.current = true;
  };

  /**
   * 处理拖拽移动 - 关键！这个会持续触发
   */
  const handleDragOver = (e: React.DragEvent) => {
    // 防止浏览器默认行为
    e.preventDefault();
    e.stopPropagation();

    // 限制检查频率，避免过度计算
    const now = Date.now();
    if (now - lastDragEventTimeRef.current < 10) {
      return;
    }
    lastDragEventTimeRef.current = now;

    // 检查是否需要滚动
    if (isDraggingRef.current) {
      checkDetectionZone(e.clientY);
    }
  };

  /**
   * 处理拖拽离开
   */
  const handleDragLeave = () => {
    isDraggingRef.current = false;
    stopAutoScroll();
  };

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = () => {
    isDraggingRef.current = false;
    stopAutoScroll();
  };

  /**
   * 处理放下
   */
  const handleDrop = () => {
    isDraggingRef.current = false;
    stopAutoScroll();
  };

  // 清理：组件卸载时停止滚动
  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  return (
    <Droppable droppableId={stage.id}>
      {(provided, snapshot) => (
        <div
          className={`w-[85vw] sm:w-96 lg:w-auto lg:flex-1 lg:min-w-[250px] h-full flex flex-col rounded-2xl p-4 border flex-shrink-0 lg:flex-shrink transition-colors duration-200 relative group ${
            snapshot.isDraggingOver
              ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50'
          }`}
        >
          {/* 头部：标题 + 滚动按钮 */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
              <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-500">
                {stage.label}
              </h3>
              <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-black text-slate-400 border border-slate-100 dark:border-slate-700">
                {tasks.length}
              </span>
            </div>

            {/* 滚动按钮 - 只在需要时显示 */}
            {(canScrollUp || canScrollDown) && (
              <div className="flex gap-1">
                <button
                  onClick={() => scroll('up')}
                  disabled={!canScrollUp}
                  aria-label={`向上滚动 ${stage.label} 列`}
                  className={`p-1 rounded-lg transition-all duration-200 ${
                    canScrollUp
                      ? 'bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 shadow-sm cursor-pointer'
                      : 'opacity-0 cursor-default pointer-events-none'
                  }`}
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => scroll('down')}
                  disabled={!canScrollDown}
                  aria-label={`向下滚动 ${stage.label} 列`}
                  className={`p-1 rounded-lg transition-all duration-200 ${
                    canScrollDown
                      ? 'bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 shadow-sm cursor-pointer'
                      : 'opacity-0 cursor-default pointer-events-none'
                  }`}
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* 列表外层容器 - 用于放置浮层检测区域和拖拽事件监听 */}
          <div
            ref={containerRef}
            className="flex-1 relative overflow-hidden"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          >
            {/* 卡片列表容器 */}
            <div
              ref={(el) => {
                provided.innerRef(el);
                listRef.current = el;
              }}
              {...provided.droppableProps}
              onScroll={handleScroll}
              className="w-full h-full overflow-y-auto pr-1 pb-2 no-scrollbar scroll-smooth"
              style={{ overscrollBehavior: 'contain' }}
            >
              {tasks.map((task, index) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  index={index}
                  onClick={onTaskClick}
                />
              ))}
              {provided.placeholder}
            </div>

            {/* 顶部检测区域 - 可视化反馈 */}
            <div
              className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
              style={{
                height: `${DRAG_SCROLL_CONFIG.DETECTION_ZONE_HEIGHT}px`,
                backgroundColor: snapshot.isDraggingOver
                  ? 'rgba(59, 130, 246, 0.08)'
                  : 'transparent',
                borderBottom: snapshot.isDraggingOver
                  ? '1px dashed rgb(59, 130, 246)'
                  : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {snapshot.isDraggingOver && (
                <div className="flex items-center justify-center h-full text-xs text-blue-500 font-bold">
                  ⬆️ 向上翻页
                </div>
              )}
            </div>

            {/* 底部检测区域 - 可视化反馈 */}
            <div
              className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
              style={{
                height: `${DRAG_SCROLL_CONFIG.DETECTION_ZONE_HEIGHT}px`,
                backgroundColor: snapshot.isDraggingOver
                  ? 'rgba(59, 130, 246, 0.08)'
                  : 'transparent',
                borderTop: snapshot.isDraggingOver
                  ? '1px dashed rgb(59, 130, 246)'
                  : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {snapshot.isDraggingOver && (
                <div className="flex items-center justify-center h-full text-xs text-blue-500 font-bold">
                  ⬇️ 向下翻页
                </div>
              )}
            </div>
          </div>

          {/* 顶部渐变：滚动越深，渐变越淡 */}
          {canScrollUp && (
            <div
              className="absolute top-16 left-4 right-4 h-6 bg-gradient-to-b from-slate-50 dark:from-slate-900/50 to-transparent pointer-events-none"
              style={{
                opacity: Math.max(0.3, 1 - scrollProgress * 1.5),
              }}
            />
          )}

          {/* 底部渐变：接近底部时，渐变越淡 */}
          {canScrollDown && (
            <div
              className="absolute bottom-4 left-4 right-4 h-8 bg-gradient-to-t from-slate-50 dark:from-slate-900/50 to-transparent pointer-events-none"
              style={{
                opacity: Math.max(0.3, scrollProgress * 1.5),
              }}
            />
          )}
        </div>
      )}
    </Droppable>
  );
}