import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Utensils,
  Truck,
  ArrowRight,
  ExternalLink,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ToastNotification } from '../types';
import { toastService, useToasts } from '../services/toastService';

interface ToastItemProps {
  toast: ToastNotification;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(toast.duration || 6000);
  const animationFrameRef = useRef<number | null>(null);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      toastService.dismissToast(toast.id);
    }, 200);
  };

  useEffect(() => {
    const totalDuration = toast.duration || 6000;

    const tick = () => {
      if (!isHovered) {
        const elapsed = Date.now() - startTimeRef.current;
        const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
        const percent = (currentRemaining / totalDuration) * 100;
        setProgress(percent);

        if (currentRemaining <= 0) {
          handleDismiss();
          return;
        }
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered, toast.duration]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    startTimeRef.current = Date.now();
  };

  const handleActionClick = () => {
    if (toast.onAction) {
      toast.onAction();
    }
    handleDismiss();
  };

  // Icon and theme config based on toast type
  const typeConfig = {
    urgent: {
      bg: 'bg-rose-950/95 border-rose-500/80 text-rose-50 shadow-rose-950/40',
      badgeBg: 'bg-rose-500/30 text-rose-200 border-rose-400/40',
      iconContainer: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      progressBar: 'bg-rose-500',
      Icon: Flame,
      actionBtn: 'bg-rose-600 hover:bg-rose-500 text-white',
    },
    success: {
      bg: 'bg-slate-900/95 border-emerald-500/70 text-emerald-50 shadow-emerald-950/40',
      badgeBg: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/30',
      iconContainer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      progressBar: 'bg-emerald-500',
      Icon: CheckCircle2,
      actionBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    },
    warning: {
      bg: 'bg-slate-900/95 border-amber-500/70 text-amber-50 shadow-amber-950/40',
      badgeBg: 'bg-amber-500/25 text-amber-200 border-amber-400/30',
      iconContainer: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      progressBar: 'bg-amber-500',
      Icon: AlertTriangle,
      actionBtn: 'bg-amber-600 hover:bg-amber-500 text-white',
    },
    info: {
      bg: 'bg-slate-900/95 border-blue-500/60 text-blue-50 shadow-blue-950/40',
      badgeBg: 'bg-blue-500/25 text-blue-200 border-blue-400/30',
      iconContainer: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      progressBar: 'bg-blue-500',
      Icon: Utensils,
      actionBtn: 'bg-blue-600 hover:bg-blue-500 text-white',
    },
  }[toast.type || 'info'];

  const IconComponent = typeConfig.Icon;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full max-w-md rounded-2xl border backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-200 pointer-events-auto ${
        typeConfig.bg
      } ${
        isExiting
          ? 'opacity-0 scale-95 translate-y-2'
          : 'opacity-100 scale-100 translate-y-0 animate-in slide-in-from-top-4 duration-300'
      }`}
      role="alert"
    >
      <div className="p-4 flex items-start gap-3.5">
        {/* Type Icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${typeConfig.iconContainer}`}
        >
          <IconComponent className="w-5 h-5 animate-pulse" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-heading font-black text-sm text-white tracking-tight leading-snug">
              {toast.title}
            </h4>
            {toast.badge && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${typeConfig.badgeBg}`}
              >
                {toast.badge}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {toast.message}
          </p>

          {/* Action Button */}
          {toast.actionLabel && (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleActionClick}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${typeConfig.actionBtn}`}
              >
                <span>{toast.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar (countdown) */}
      <div className="h-1 w-full bg-white/10 overflow-hidden">
        <div
          className={`h-full transition-all ease-linear ${typeConfig.progressBar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed z-[9999] top-4 right-4 left-4 sm:left-auto sm:w-[420px] flex flex-col gap-2.5 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
