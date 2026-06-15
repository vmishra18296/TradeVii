'use client';

import { useState, useEffect } from 'react';
import { Card, Button, showToast } from '@/components/ui';
import { getWithdrawalRequests, saveWithdrawalRequests, logAdminAction } from '@/lib/database';
import { useRole } from '@/hooks/useRole';
import { useAppStore } from '@/stores/useAppStore';
import { formatCurrency } from '@/lib/utils';

interface WithdrawalReq {
  investorName: string;
  amount: number;
  reason?: string;
  status: string;
  createdAt: number;
}

export default function WithdrawalsPage() {
  const [requests, setRequests] = useState<WithdrawalReq[]>([]);
  const { isAdmin, isInvestor } = useRole();
  const { investorName } = useAppStore();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqAmount, setReqAmount] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getWithdrawalRequests().then((data) => setRequests(data as WithdrawalReq[]));
  }, []);

  // For investors, filter to only their requests
  const displayRequests = isInvestor
    ? requests.filter((r) => r.investorName === investorName)
    : requests;

  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(reqAmount);
    if (!amount || amount <= 0) {
      showToast('Enter a valid amount', 'error');
      return;
    }
    setSubmitting(true);
    const newReq: WithdrawalReq = {
      investorName: investorName || 'Unknown',
      amount,
      reason: reqReason || undefined,
      status: 'pending',
      createdAt: Date.now(),
    };
    const updated = [...requests, newReq];
    setRequests(updated);
    await saveWithdrawalRequests(updated);
    showToast('Withdrawal request submitted!', 'success');
    setShowRequestForm(false);
    setReqAmount('');
    setReqReason('');
    setSubmitting(false);
  }

  async function handleApprove(idx: number) {
    const globalIdx = requests.indexOf(displayRequests[idx]);
    const updated = [...requests];
    updated[globalIdx].status = 'approved';
    setRequests(updated);
    await saveWithdrawalRequests(updated);
    await logAdminAction('APPROVE_WITHDRAWAL', { investor: updated[globalIdx].investorName });
    showToast('Withdrawal approved', 'success');
  }

  async function handleReject(idx: number) {
    const globalIdx = requests.indexOf(displayRequests[idx]);
    const updated = [...requests];
    updated[globalIdx].status = 'rejected';
    setRequests(updated);
    await saveWithdrawalRequests(updated);
    await logAdminAction('REJECT_WITHDRAWAL', { investor: updated[globalIdx].investorName });
    showToast('Withdrawal rejected', 'info');
  }

  return (
    <div className="space-y-6">
      {/* Investor: Submit request */}
      {isInvestor && (
        <Card title="Request Withdrawal">
          {!showRequestForm ? (
            <div className="text-center py-4">
              <p className="text-sm text-[var(--text-muted)] mb-3">Need to withdraw funds from your investment?</p>
              <Button onClick={() => setShowRequestForm(true)}>New Withdrawal Request</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitRequest} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={reqAmount}
                  onChange={(e) => setReqAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Reason (optional)</label>
                <textarea
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="Why do you need this withdrawal?"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowRequestForm(false)}>Cancel</Button>
                <Button type="submit" loading={submitting}>Submit Request</Button>
              </div>
            </form>
          )}
        </Card>
      )}

      <Card title="Withdrawal Requests">
        {displayRequests.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-12">No withdrawal requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-3 text-[var(--text-muted)]">Investor</th>
                  <th className="text-right py-3 px-3 text-[var(--text-muted)]">Amount</th>
                  <th className="text-left py-3 px-3 text-[var(--text-muted)]">Reason</th>
                  <th className="text-center py-3 px-3 text-[var(--text-muted)]">Status</th>
                  {isAdmin && <th className="text-center py-3 px-3 text-[var(--text-muted)]">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {displayRequests.map((req, i) => (
                  <tr key={i} className="border-b border-[var(--border)]/50">
                    <td className="py-2.5 px-3 text-[var(--text-primary)]">{req.investorName}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{formatCurrency(req.amount)}</td>
                    <td className="py-2.5 px-3 text-slate-300">{req.reason || '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                        req.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>{req.status}</span>
                    </td>
                    {isAdmin && (
                      <td className="py-2.5 px-3 text-center space-x-2">
                        {req.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(i)} className="text-emerald-400 hover:text-emerald-300 text-xs">Approve</button>
                            <button onClick={() => handleReject(i)} className="text-red-400 hover:text-red-300 text-xs">Reject</button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
