'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { getAdminLogs } from '@/lib/database';
import type { AdminLog } from '@/types';

export default function AdminLogPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);

  useEffect(() => {
    getAdminLogs().then((data) => setLogs(data.reverse()));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Activity Log</h1>

      <Card>
        {logs.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-12">No activity logged yet.</p>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/30">
                <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)] font-medium">{log.action}</p>
                  {log.details && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                      {JSON.stringify(log.details)}
                    </p>
                  )}
                </div>
                <time className="text-xs text-[var(--text-muted)] flex-shrink-0">
                  {new Date(log.timestamp).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </time>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
