'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/stores/useAppStore';
import { ref, get, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { SystemSettings } from '@/types';
import { logAdminAction } from '@/lib/database';

const defaultSettings: SystemSettings = {
  interestRate: 9,
  profitSharePercent: 10,
  minWithdrawal: 1000,
  maxWithdrawal: 500000,
  autoApproveWithdrawals: false,
  maintenanceMode: false,
  platformName: 'TradeVii',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { addNotification } = useAppStore();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const snapshot = await get(ref(database, 'tradevii/settings'));
    if (snapshot.val()) {
      setSettings({ ...defaultSettings, ...snapshot.val() });
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await set(ref(database, 'tradevii/settings'), settings);
      await logAdminAction('Updated system settings', settings as unknown as Record<string, unknown>);
      addNotification({ title: 'Settings Saved', message: 'System settings have been updated.', type: 'success' });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      addNotification({ title: 'Error', message: 'Failed to save settings', type: 'error' });
    }
    setSaving(false);
  }

  function updateField<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Settings</h1>

      {/* Platform Settings */}
      <Card title="Platform Configuration">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Platform Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => updateField('platformName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-300">Maintenance Mode</p>
              <p className="text-xs text-[var(--text-muted)]">Disable access for investors</p>
            </div>
            <button
              onClick={() => updateField('maintenanceMode', !settings.maintenanceMode)}
              className={`relative w-11 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.maintenanceMode ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Financial Settings */}
      <Card title="Financial Configuration">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Annual Interest Rate (%)</label>
            <input
              type="number"
              value={settings.interestRate}
              onChange={(e) => updateField('interestRate', Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Profit Share (%)</label>
            <input
              type="number"
              value={settings.profitSharePercent}
              onChange={(e) => updateField('profitSharePercent', Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Min Withdrawal (₹)</label>
            <input
              type="number"
              value={settings.minWithdrawal}
              onChange={(e) => updateField('minWithdrawal', Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Max Withdrawal (₹)</label>
            <input
              type="number"
              value={settings.maxWithdrawal}
              onChange={(e) => updateField('maxWithdrawal', Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
        <div className="flex items-center justify-between py-3 mt-4 border-t border-[var(--border)]">
          <div>
            <p className="text-sm font-medium text-slate-300">Auto-approve Withdrawals</p>
            <p className="text-xs text-[var(--text-muted)]">Automatically approve withdrawal requests below min threshold</p>
          </div>
          <button
            onClick={() => updateField('autoApproveWithdrawals', !settings.autoApproveWithdrawals)}
            className={`relative w-11 h-6 rounded-full transition-colors ${settings.autoApproveWithdrawals ? 'bg-emerald-600' : 'bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.autoApproveWithdrawals ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
        </button>
        {saved && <span className="text-xs text-emerald-400">Settings saved successfully</span>}
      </div>
    </div>
  );
}
