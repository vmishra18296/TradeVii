'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { DataTable } from '@/components/ui/DataTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getSignupRequests, approveSignupRequest, rejectSignupRequest, logAdminAction } from '@/lib/database';
import { useAppStore } from '@/stores/useAppStore';
import type { SignupRequest } from '@/types';

export default function AdminUsersPage() {
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [confirm, setConfirm] = useState<{ open: boolean; type: 'approve' | 'reject'; uid: string; name: string }>({ open: false, type: 'approve', uid: '', name: '' });
  const { addNotification } = useAppStore();

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    const data = await getSignupRequests();
    setRequests(data.sort((a, b) => b.createdAt - a.createdAt));
  }

  async function handleAction() {
    try {
      if (confirm.type === 'approve') {
        await approveSignupRequest(confirm.uid);
        await logAdminAction('Approved user signup', { uid: confirm.uid, name: confirm.name });
        addNotification({ title: 'User Approved', message: `${confirm.name} has been approved.`, type: 'success' });
      } else {
        await rejectSignupRequest(confirm.uid);
        await logAdminAction('Rejected user signup', { uid: confirm.uid, name: confirm.name });
        addNotification({ title: 'User Rejected', message: `${confirm.name} has been rejected.`, type: 'warning' });
      }
      setConfirm({ open: false, type: 'approve', uid: '', name: '' });
      loadRequests();
    } catch {
      addNotification({ title: 'Error', message: 'Failed to process action', type: 'error' });
    }
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const approved = requests.filter((r) => r.status === 'approved');
  const rejected = requests.filter((r) => r.status === 'rejected');

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'mobile', label: 'Mobile' },
    {
      key: 'status',
      label: 'Status',
      render: (item: Record<string, unknown>) => {
        const s = item.status as string;
        const variant = s === 'approved' ? 'success' : s === 'rejected' ? 'error' : 'warning';
        return <Badge variant={variant}>{s}</Badge>;
      },
    },
    {
      key: 'createdAt',
      label: 'Signed Up',
      sortable: true,
      render: (item: Record<string, unknown>) =>
        new Date(item.createdAt as number).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">User Management</h1>
        <div className="flex items-center gap-3">
          <Badge variant="warning" size="md">{pending.length} pending</Badge>
          <Badge variant="success" size="md">{approved.length} approved</Badge>
        </div>
      </div>

      <Card>
        <Tabs
          tabs={[
            { id: 'pending', label: 'Pending', badge: pending.length },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'all', label: 'All Users' },
          ]}
          defaultTab="pending"
        >
          {(tab) => {
            const data = tab === 'pending' ? pending : tab === 'approved' ? approved : tab === 'rejected' ? rejected : requests;
            return (
              <DataTable
                data={data as unknown as Record<string, unknown>[]}
                columns={columns}
                searchPlaceholder="Search users..."
                emptyMessage="No users found"
                actions={(item) => {
                  const r = item as unknown as SignupRequest;
                  if (r.status === 'pending') {
                    return (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setConfirm({ open: true, type: 'approve', uid: r.uid, name: r.name })}
                          className="px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setConfirm({ open: true, type: 'reject', uid: r.uid, name: r.name })}
                          className="px-2.5 py-1 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-500"
                        >
                          Reject
                        </button>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            );
          }}
        </Tabs>
      </Card>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.type === 'approve' ? 'Approve User' : 'Reject User'}
        message={`Are you sure you want to ${confirm.type} ${confirm.name}?`}
        confirmLabel={confirm.type === 'approve' ? 'Approve' : 'Reject'}
        variant={confirm.type === 'approve' ? 'info' : 'danger'}
        onConfirm={handleAction}
        onCancel={() => setConfirm({ open: false, type: 'approve', uid: '', name: '' })}
      />
    </div>
  );
}
