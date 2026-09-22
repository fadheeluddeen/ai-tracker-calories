import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pill, Plus, Trash2, X, Check, Clock } from 'lucide-react';
import {
  getSupplements,
  createSupplement,
  updateSupplement,
  deleteSupplement,
  Supplement,
} from '../api';
import { hapticLight, hapticMedium, hapticSuccess, hapticWarning } from '../utils/haptics';

function parseTimes(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (/^\d:\d{2}$/.test(t) ? `0${t}` : t));
}

export const SupplementsView: React.FC = () => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timesText, setTimesText] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const { supplements } = await getSupplements();
      setSupplements(supplements);
    } catch (err) {
      console.error('Failed to load supplements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setName('');
    setDosage('');
    setTimesText('');
    setEditing(null);
    setShowForm(false);
    setError(null);
  };

  const openCreate = () => {
    hapticMedium();
    resetForm();
    setShowForm(true);
  };

  const openEdit = (s: Supplement) => {
    hapticLight();
    setEditing(s);
    setName(s.name);
    setDosage(s.dosage || '');
    setTimesText(s.schedule_times.map((t) => t.slice(0, 5)).join(', '));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);

    const schedule_times = parseTimes(timesText);

    try {
      if (editing) {
        await updateSupplement(editing.id, {
          name: name.trim(),
          dosage: dosage.trim() || undefined,
          schedule_times,
          active: editing.active,
        });
      } else {
        await createSupplement({ name: name.trim(), dosage: dosage.trim() || undefined, schedule_times });
      }
      hapticSuccess();
      resetForm();
      await load();
    } catch (err: any) {
      hapticWarning();
      setError(err.message || 'Failed to save supplement');
    }
  };

  const handleToggleActive = async (s: Supplement) => {
    hapticLight();
    try {
      await updateSupplement(s.id, {
        name: s.name,
        dosage: s.dosage || undefined,
        schedule_times: s.schedule_times,
        active: !s.active,
      });
      await load();
    } catch (err) {
      console.error('Failed to toggle supplement:', err);
    }
  };

  const handleDelete = async (id: number) => {
    hapticWarning();
    if (!window.confirm('Delete this supplement?')) return;
    try {
      await deleteSupplement(id);
      await load();
    } catch (err) {
      console.error('Failed to delete supplement:', err);
    }
  };

  return (
    <div className="space-y-4 pb-24 select-none">
      <div className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              Daily Routine
            </span>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Supplements</h2>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Push notifications fire at scheduled times</span>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="liquid-droplet-dark text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-md hover:brightness-110"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="liquid-glass rounded-3xl p-8 text-center text-xs text-neutral-500">Loading...</div>
      ) : supplements.length === 0 ? (
        <div className="liquid-glass liquid-sheen rounded-3xl p-8 text-center border border-white/70 shadow-sm">
          <div className="w-14 h-14 rounded-3xl liquid-droplet mx-auto flex items-center justify-center text-neutral-700 mb-3 shadow-inner">
            <Pill className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">No supplements yet</h3>
          <p className="text-xs text-neutral-600 max-w-xs mx-auto mt-1 leading-relaxed">
            Add a supplement with the times you take it, and you'll get a push reminder.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {supplements.map((s) => (
            <div
              key={s.id}
              className="liquid-glass liquid-sheen rounded-2xl p-4 border border-white/70 shadow-sm flex items-center justify-between gap-3"
            >
              <button type="button" onClick={() => openEdit(s)} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-neutral-900 truncate">{s.name}</h4>
                  {!s.active && (
                    <span className="text-[9px] font-bold uppercase text-neutral-500 px-1.5 py-0.5 rounded-full liquid-glass-subtle border border-white/50">
                      Paused
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-600 flex items-center gap-2 mt-0.5 font-medium flex-wrap">
                  {s.dosage && <span>{s.dosage}</span>}
                  {s.schedule_times.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {s.schedule_times.map((t) => t.slice(0, 5)).join(', ')}
                    </span>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleActive(s)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    s.active ? 'liquid-droplet-dark text-white' : 'liquid-glass-subtle text-neutral-500'
                  }`}
                  title={s.active ? 'Pause reminders' : 'Resume reminders'}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  className="w-8 h-8 rounded-full liquid-droplet text-neutral-600 hover:text-red-600 flex items-center justify-center transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.9 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-lg liquid-glass-thick liquid-sheen rounded-t-[36px] sm:rounded-[36px] border border-white/80 shadow-2xl overflow-hidden z-10"
            >
              <div className="w-full pt-3 pb-1 flex justify-center relative z-10">
                <div className="w-10 h-1 bg-neutral-400/60 rounded-full" />
              </div>

              <div className="px-5 py-3 flex items-center justify-between border-b border-white/30 relative z-10">
                <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                  {editing ? 'Edit Supplement' : 'Add Supplement'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-8 h-8 rounded-full liquid-droplet flex items-center justify-center text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vitamin D3"
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">Dosage</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 2000 IU"
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                    Reminder times (24h, comma-separated)
                  </label>
                  <input
                    type="text"
                    value={timesText}
                    onChange={(e) => setTimesText(e.target.value)}
                    placeholder="e.g. 08:00, 20:00"
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                  />
                </div>

                {error && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-2.5">{error}</div>}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl liquid-droplet-dark text-white font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editing ? 'Save Changes' : 'Add Supplement'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
