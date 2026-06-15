'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useRole } from '@/hooks/useRole';
import { saveTrades, logAdminAction } from '@/lib/database';
import { Card, Button, Modal, showToast, DateRangePicker, Badge, ConfirmDialog } from '@/components/ui';
import { formatCurrency, formatDate, getTagTailwind, todayStr } from '@/lib/utils';
import type { Trade } from '@/types';
import * as XLSX from 'xlsx';

export default function TradingPage() {
  const { trades, setTrades, addNotification } = useAppStore();
  const { canWrite } = useRole();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({ date: todayStr(), stock: '', type: 'Intraday', quantity: '', buyValue: '', sellValue: '', notes: '', strategy: '' });
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedTrades, setSelectedTrades] = useState<Set<number>>(new Set());
  const pageSize = 20;

  // Filtered & sorted trades
  const filtered = useMemo(() => {
    let result = [...trades].reverse();
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.stock.toLowerCase().includes(q) || t.type.toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q));
    }
    if (dateRange) {
      result = result.filter((t) => t.date >= dateRange.from && t.date <= dateRange.to);
    }
    if (selectedType) {
      result = result.filter((t) => t.type.toLowerCase().includes(selectedType.toLowerCase()));
    }
    return result;
  }, [trades, search, dateRange, selectedType]);

  // Stats for filtered data
  const stats = useMemo(() => {
    const totalPL = filtered.reduce((s, t) => s + (t.netPL || 0), 0);
    const totalTurnover = filtered.reduce((s, t) => s + (t.turnover || 0), 0);
    const wins = filtered.filter((t) => t.netPL > 0).length;
    const losses = filtered.filter((t) => t.netPL < 0).length;
    const winRate = filtered.length > 0 ? (wins / filtered.length) * 100 : 0;
    const biggestWin = filtered.reduce((max, t) => Math.max(max, t.netPL || 0), 0);
    const biggestLoss = filtered.reduce((min, t) => Math.min(min, t.netPL || 0), 0);
    return { totalPL, totalTurnover, wins, losses, winRate, biggestWin, biggestLoss, count: filtered.length };
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function handleAddTrade(e: React.FormEvent) {
    e.preventDefault();
    const buyVal = parseFloat(form.buyValue) || 0;
    const sellVal = parseFloat(form.sellValue) || 0;
    const newTrade: Trade = {
      date: form.date,
      stock: form.stock.toUpperCase(),
      type: form.type,
      quantity: parseInt(form.quantity) || 0,
      buyValue: buyVal,
      sellValue: sellVal,
      turnover: buyVal + sellVal,
      netPL: sellVal - buyVal,
      notes: form.notes || undefined,
      strategy: form.strategy || undefined,
    };
    const updated = [...trades, newTrade];
    setTrades(updated);
    await saveTrades(updated);
    await logAdminAction('ADD_TRADE', { stock: newTrade.stock, netPL: newTrade.netPL });
    showToast('Trade added!', 'success');
    addNotification({ title: 'Trade Added', message: `${newTrade.stock} ${newTrade.type} — P&L: ${formatCurrency(newTrade.netPL)}`, type: newTrade.netPL >= 0 ? 'success' : 'warning' });
    setShowAddModal(false);
    setForm({ date: todayStr(), stock: '', type: 'Intraday', quantity: '', buyValue: '', sellValue: '', notes: '', strategy: '' });
  }

  async function handleBulkDelete() {
    if (selectedTrades.size === 0) return;
    // selectedTrades indices are relative to the `filtered` array
    // Map them back to the original trades array for correct deletion
    const filteredArr = [...trades].reverse();
    const toDelete = new Set<number>();
    for (const filteredIdx of selectedTrades) {
      const trade = filteredArr[filteredIdx];
      if (trade) {
        // Find the trade in the original array
        const origIdx = trades.indexOf(trade);
        if (origIdx !== -1) toDelete.add(origIdx);
      }
    }
    const remaining = trades.filter((_, i) => !toDelete.has(i));
    setTrades(remaining);
    await saveTrades(remaining);
    await logAdminAction('BULK_DELETE_TRADES', { count: selectedTrades.size });
    showToast(`${selectedTrades.size} trades deleted`, 'success');
    setSelectedTrades(new Set());
  }

  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
        if (json.length === 0) { showToast('Excel file is empty!', 'error'); return; }

        const imported: Trade[] = json.map((row) => {
          const buyVal = parseFloat(String(row['Buy Value'] || row['buyValue'] || 0));
          const sellVal = parseFloat(String(row['Sell Value'] || row['sellValue'] || 0));
          return {
            date: String(row['Date'] || row['date'] || todayStr()),
            stock: String(row['Stock'] || row['stock'] || row['Symbol'] || ''),
            type: String(row['Type'] || row['type'] || 'Intraday'),
            quantity: parseInt(String(row['Quantity'] || row['quantity'] || row['Qty'] || 0)),
            buyValue: buyVal,
            sellValue: sellVal,
            turnover: buyVal + sellVal,
            netPL: sellVal - buyVal,
          };
        });

        const updated = [...trades, ...imported];
        setTrades(updated);
        await saveTrades(updated);
        await logAdminAction('EXCEL_IMPORT_TRADES', { importedCount: imported.length });
        showToast(`${imported.length} trades imported!`, 'success');
        addNotification({ title: 'Excel Import', message: `${imported.length} trades imported successfully.`, type: 'success' });
      } catch {
        showToast('Failed to parse Excel file', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  }

  function handleExport() {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((t) => ({
        Date: t.date, Stock: t.stock, Type: t.type, Quantity: t.quantity,
        'Buy Value': t.buyValue, 'Sell Value': t.sellValue, Turnover: t.turnover,
        'Net P&L': t.netPL, Strategy: t.strategy || '', Notes: t.notes || '',
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trades');
    XLSX.writeFile(wb, `tradevii_trades_${todayStr()}.xlsx`);
  }

  function toggleTradeSelect(idx: number) {
    setSelectedTrades((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 text-center hover:border-indigo-500/30 transition-colors">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Total Trades</p>
          <p className="text-lg font-bold text-indigo-400">{stats.count}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 text-center hover:border-emerald-500/30 transition-colors">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Net P&L</p>
          <p className={`text-lg font-bold ${stats.totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(stats.totalPL)}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 text-center hover:border-cyan-500/30 transition-colors">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Turnover</p>
          <p className="text-lg font-bold text-cyan-400">{formatCurrency(stats.totalTurnover)}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 text-center hover:border-purple-500/30 transition-colors">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Win Rate</p>
          <p className="text-lg font-bold text-purple-400">{stats.winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 text-center hover:border-amber-500/30 transition-colors">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Wins / Losses</p>
          <p className="text-lg font-bold"><span className="text-emerald-400">{stats.wins}</span> / <span className="text-red-400">{stats.losses}</span></p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 text-center hover:border-emerald-500/30 transition-colors">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Best Trade</p>
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(stats.biggestWin)}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 text-center hover:border-red-500/30 transition-colors">
          <p className="text-[10px] uppercase text-[var(--text-muted)] font-medium">Worst Trade</p>
          <p className="text-lg font-bold text-red-400">{formatCurrency(stats.biggestLoss)}</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <DateRangePicker
          onApply={(from, to) => { setDateRange({ from, to }); setPage(1); }}
          onClear={() => setDateRange(null)}
        />
      </Card>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3">
        {canWrite && (
          <>
            <Button onClick={() => setShowAddModal(true)}>+ Add Trade</Button>
            <label className="cursor-pointer inline-flex">
              <span className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 bg-slate-700 hover:bg-slate-600 text-[var(--text-primary)] px-4 py-2 text-sm">
                Upload Excel
              </span>
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelUpload} />
            </label>
          </>
        )}
        <Button variant="ghost" onClick={handleExport}>Export Filtered</Button>
        {selectedTrades.size > 0 && canWrite && (
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete ({selectedTrades.size})
          </Button>
        )}

        {/* Search & Type filter */}
        <div className="ml-auto flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="intraday">Intraday</option>
            <option value="swing">Swing</option>
            <option value="positional">Positional</option>
            <option value="f&o">F&O</option>
          </select>
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search stock..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-300 w-40 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Trades table */}
      <Card>
        {filtered.length === 0 ? (
          <p className="text-[var(--text-muted)] text-center py-12">No trades found. Upload Excel or add manually.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {canWrite && <th className="py-3 px-2 w-8"><input type="checkbox" className="rounded" onChange={(e) => {
                      if (e.target.checked) setSelectedTrades(new Set(paginated.map((_, i) => (page - 1) * pageSize + i)));
                      else setSelectedTrades(new Set());
                    }} /></th>}
                    <th className="text-left py-3 px-3 text-[var(--text-muted)] font-medium text-xs">Date</th>
                    <th className="text-left py-3 px-3 text-[var(--text-muted)] font-medium text-xs">Stock</th>
                    <th className="text-left py-3 px-3 text-[var(--text-muted)] font-medium text-xs">Type</th>
                    <th className="text-right py-3 px-3 text-[var(--text-muted)] font-medium text-xs">Qty</th>
                    <th className="text-right py-3 px-3 text-[var(--text-muted)] font-medium text-xs">Buy</th>
                    <th className="text-right py-3 px-3 text-[var(--text-muted)] font-medium text-xs">Sell</th>
                    <th className="text-right py-3 px-3 text-[var(--text-muted)] font-medium text-xs">Turnover</th>
                    <th className="text-right py-3 px-3 text-[var(--text-muted)] font-medium text-xs">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t, i) => {
                    const globalIdx = (page - 1) * pageSize + i;
                    return (
                      <tr key={globalIdx} className={`border-b border-[var(--border)]/50 hover:bg-slate-800/30 ${selectedTrades.has(globalIdx) ? 'bg-indigo-500/10' : ''}`}>
                        {canWrite && <td className="py-2.5 px-2"><input type="checkbox" checked={selectedTrades.has(globalIdx)} onChange={() => toggleTradeSelect(globalIdx)} className="rounded" /></td>}
                        <td className="py-2.5 px-3 text-slate-300 text-xs">{formatDate(t.date)}</td>
                        <td className="py-2.5 px-3 text-[var(--text-primary)] font-medium">{t.stock}</td>
                        <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${getTagTailwind(t.type)}`}>{t.type}</span></td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{t.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-[var(--text-muted)] text-xs">{formatCurrency(t.buyValue)}</td>
                        <td className="py-2.5 px-3 text-right text-[var(--text-muted)] text-xs">{formatCurrency(t.sellValue)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{formatCurrency(t.turnover)}</td>
                        <td className={`py-2.5 px-3 text-right font-semibold ${(t.netPL || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(t.netPL)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)]">Page {page} of {totalPages} ({filtered.length} trades)</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40">Prev</button>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Add Trade Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Trade">
        <form onSubmit={handleAddTrade} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Stock</label>
              <input type="text" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500" required placeholder="NIFTY" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Intraday</option><option>Swing</option><option>Positional</option><option>F&O</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Quantity</label>
              <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Buy Value (₹)</label>
              <input type="number" step="0.01" value={form.buyValue} onChange={(e) => setForm({ ...form, buyValue: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Sell Value (₹)</label>
              <input type="number" step="0.01" value={form.sellValue} onChange={(e) => setForm({ ...form, sellValue: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Strategy (optional)</label>
            <select value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">No strategy</option>
              <option>Breakout</option><option>Momentum</option><option>Reversal</option><option>Scalping</option><option>Gap Trading</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2} placeholder="Trade notes..." />
          </div>
          <Button type="submit" className="w-full">Add Trade</Button>
        </form>
      </Modal>

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Trades"
        message={`Are you sure you want to delete ${selectedTrades.size} selected trade(s)? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { setShowDeleteConfirm(false); handleBulkDelete(); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
