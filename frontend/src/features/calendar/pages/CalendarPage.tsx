import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import {
  fetchEventsFn,
  createEventFn,
  updateEventFn,
  deleteEventFn,
  CalendarEvent,
} from '../services/calendar.api';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Calendar,
  Clock,
  Edit3,
} from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const EVENT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
];

interface EventModal {
  open: boolean;
  mode: 'create' | 'edit';
  date?: Date;
  event?: CalendarEvent;
}

export const CalendarPage = () => {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [modal, setModal] = useState<EventModal>({ open: false, mode: 'create' });
  const [form, setForm] = useState({ title: '', description: '', color: '#6366f1' });

  const month = viewDate.getMonth() + 1;
  const year = viewDate.getFullYear();

  const { data: events = [] } = useQuery({
    queryKey: ['calendarEvents', month, year],
    queryFn: () => fetchEventsFn(token!, month, year),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createEventFn(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateEventFn(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEventFn(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendarEvents'] }),
  });

  const prevMonth = () => setViewDate(new Date(year, viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, viewDate.getMonth() + 1, 1));

  const closeModal = () => {
    setModal({ open: false, mode: 'create' });
    setForm({ title: '', description: '', color: '#6366f1' });
  };

  const openCreate = (date: Date) => {
    setForm({ title: '', description: '', color: '#6366f1' });
    setModal({ open: true, mode: 'create', date });
  };

  const openEdit = (event: CalendarEvent) => {
    setForm({ title: event.title, description: event.description || '', color: event.color });
    setModal({ open: true, mode: 'edit', event });
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;

    if (modal.mode === 'create' && modal.date) {
      createMutation.mutate({
        title: form.title,
        description: form.description,
        date: modal.date.toISOString(),
        color: form.color,
      });
    } else if (modal.mode === 'edit' && modal.event) {
      updateMutation.mutate({
        id: modal.event.id,
        data: { title: form.title, description: form.description, color: form.color },
      });
    }
  };

  // Build calendar grid
  const firstDay = new Date(year, viewDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, viewDate.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const getEventsForDay = (day: number) =>
    events.filter((e) => new Date(e.date).getDate() === day);

  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === viewDate.getMonth() &&
    today.getFullYear() === year;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-400" />
            Calendar
          </h1>
          <p className="text-zinc-400 mt-1">Track your study activities and goals</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition text-zinc-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-white min-w-[180px] text-center">
            {MONTHS[viewDate.getMonth()]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition text-zinc-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-zinc-950/60 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/5">
          {DAYS.map((d) => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            return (
              <div
                key={idx}
                onClick={() => day && openCreate(new Date(year, viewDate.getMonth(), day))}
                className={`min-h-[110px] p-2 border-b border-r border-white/5 relative group cursor-pointer transition-colors
                  ${day ? 'hover:bg-white/[0.02]' : 'bg-zinc-950/30 cursor-default'}
                  ${idx % 7 === 6 ? 'border-r-0' : ''}
                `}
              >
                {day && (
                  <>
                    {/* Day number */}
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 transition-colors
                      ${isToday(day)
                        ? 'bg-indigo-500 text-white font-bold'
                        : 'text-zinc-400 group-hover:text-white'
                      }`}>
                      {day}
                    </div>

                    {/* Add button on hover */}
                    <button
                      onClick={(e) => { e.stopPropagation(); openCreate(new Date(year, viewDate.getMonth(), day)); }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full bg-indigo-500/30 hover:bg-indigo-500 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>

                    {/* Events */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); openEdit(event); }}
                          className="text-xs px-2 py-0.5 rounded-md truncate cursor-pointer hover:opacity-80 transition-opacity font-medium"
                          style={{ backgroundColor: event.color + '33', color: event.color, border: `1px solid ${event.color}40` }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-zinc-500 px-2">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming events sidebar summary */}
      {events.length > 0 && (
        <div className="mt-6 bg-zinc-950/40 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> This Month's Activities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-xl border bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors cursor-pointer group"
                style={{ borderColor: event.color + '40' }}
                onClick={() => openEdit(event)}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{event.title}</p>
                  <p className="text-xs text-zinc-500">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(event.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {modal.mode === 'create' ? <Plus className="w-5 h-5 text-indigo-400" /> : <Edit3 className="w-5 h-5 text-indigo-400" />}
                {modal.mode === 'create' ? 'New Activity' : 'Edit Activity'}
              </h3>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modal.date && modal.mode === 'create' && (
              <p className="text-sm text-zinc-400 mb-4">
                📅 {modal.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Study Python Chapter 5"
                  className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional notes..."
                  rows={3}
                  className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {EVENT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-zinc-900 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c, ringColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {modal.mode === 'edit' && modal.event && (
                  <button
                    onClick={() => { deleteMutation.mutate(modal.event!.id); closeModal(); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 border border-white/10 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.title.trim() || createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: form.color }}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : modal.mode === 'create' ? 'Add Activity' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
