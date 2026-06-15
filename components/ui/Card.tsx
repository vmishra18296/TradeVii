import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function Card({ children, className = '', title, icon, action }: CardProps) {
  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon && <span className="text-indigo-400">{icon}</span>}
            {title && <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
