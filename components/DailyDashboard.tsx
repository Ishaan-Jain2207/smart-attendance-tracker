import React, { useState } from 'react';
import { Subject, DailyRecord } from '../types';

interface DailyDashboardProps {
  subjects: Subject[];
  records: Record<string, DailyRecord>;
  onUpdateRecord: (date: string, subjectId: string, status: 'present' | 'absent' | 'no-class') => void;
}

export const DailyDashboard: React.FC<DailyDashboardProps> = ({ subjects, records, onUpdateRecord }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const getStatus = (subjectId: string) => {
    return records[selectedDate]?.[subjectId] || 'no-class';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Daily Attendance Log</h2>
          <p className="text-sm text-slate-500">Track your attendance day by day</p>
        </div>
        <input 
          type="date" 
          value={selectedDate}
          onChange={handleDateChange}
          className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-4">
        {subjects.map(subject => (
          <div key={subject.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="font-medium text-slate-700">{subject.name}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateRecord(selectedDate, subject.id, 'present')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  getStatus(subject.id) === 'present' 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Present
              </button>
              <button
                onClick={() => onUpdateRecord(selectedDate, subject.id, 'absent')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  getStatus(subject.id) === 'absent' 
                    ? 'bg-rose-500 text-white shadow-sm' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Absent
              </button>
              <button
                onClick={() => onUpdateRecord(selectedDate, subject.id, 'no-class')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  getStatus(subject.id) === 'no-class' 
                    ? 'bg-slate-500 text-white shadow-sm' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                No Class
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
