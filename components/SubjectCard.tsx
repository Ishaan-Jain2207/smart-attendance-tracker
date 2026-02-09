import React from 'react';
import { Subject, TARGET_PERCENTAGE } from '../types';
import { calculateStats, formatPercent } from '../utils';

interface SubjectCardProps {
  subject: Subject;
  onUpdate: (id: string, newAttended: number, newConducted: number) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onUpdate }) => {
  const stats = calculateStats(subject.classesAttended, subject.conductedClasses, subject.fixedTotalClasses);

  const handleAttend = (increment: boolean) => {
    if (increment) {
      if (subject.conductedClasses < subject.fixedTotalClasses) {
        onUpdate(subject.id, subject.classesAttended + 1, subject.conductedClasses + 1);
      }
    } else {
      if (subject.classesAttended > 0 && subject.conductedClasses > 0) {
        onUpdate(subject.id, subject.classesAttended - 1, subject.conductedClasses - 1);
      }
    }
  };

  const handleMiss = (increment: boolean) => {
    if (increment) {
      if (subject.conductedClasses < subject.fixedTotalClasses) {
        onUpdate(subject.id, subject.classesAttended, subject.conductedClasses + 1);
      }
    } else {
      if (subject.conductedClasses > subject.classesAttended) {
        onUpdate(subject.id, subject.classesAttended, subject.conductedClasses - 1);
      }
    }
  };

  const getProgressBarColor = () => {
    if (stats.percentage >= TARGET_PERCENTAGE) return 'bg-emerald-500';
    if (stats.percentage >= 75) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-800 leading-tight pr-2 min-h-[3rem] line-clamp-2">
            {subject.name}
            </h3>
            <span className={`px-2 py-1 rounded text-xs font-bold ${
                stats.percentage >= TARGET_PERCENTAGE ? 'bg-emerald-100 text-emerald-700' : 
                stats.percentage >= 75 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
            }`}>
            {formatPercent(stats.percentage)}
            </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
            <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`} 
            style={{ width: `${Math.min(100, stats.percentage)}%` }}
            ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-white">
        <div className="p-3 text-center">
            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Total (Conducted)</div>
            <div className="font-bold text-slate-900">{subject.conductedClasses} <span className="text-slate-400 font-normal">/ {subject.fixedTotalClasses}</span></div>
        </div>
        <div className="p-3 text-center">
            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Attended</div>
            <div className="font-bold text-emerald-600">{subject.classesAttended}</div>
        </div>
        <div className="p-3 text-center">
            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Missed</div>
            <div className="font-bold text-rose-500">{stats.classesMissed}</div>
        </div>
      </div>

      {/* Action Area */}
      <div className="p-4 bg-white flex-1 flex flex-col justify-between">
        <div className="mb-4">
             {stats.percentage < TARGET_PERCENTAGE ? (
                <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                    Warning: Attend next <strong className="font-bold">{stats.classesNeededToReachTarget}</strong> class(es) to recover.
                </p>
            ) : (
                <p className="text-sm text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100">
                    Safe: You can miss <strong className="font-bold">{stats.classesCanMiss}</strong> future class(es) based on semester total.
                </p>
            )}
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
                <span className="text-xs text-center text-slate-400 font-medium">Attend</span>
                <div className="flex items-center shadow-sm rounded-lg overflow-hidden border border-emerald-200">
                    <button 
                        onClick={() => handleAttend(false)}
                        className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 active:bg-emerald-200 transition-colors border-r border-emerald-200"
                    >-</button>
                    <button 
                        onClick={() => handleAttend(true)}
                        className="flex-[1.5] py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold active:bg-emerald-300 transition-colors"
                    >+</button>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs text-center text-slate-400 font-medium">Miss</span>
                <div className="flex items-center shadow-sm rounded-lg overflow-hidden border border-rose-200">
                    <button 
                        onClick={() => handleMiss(false)}
                        className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 active:bg-rose-200 transition-colors border-r border-rose-200"
                    >-</button>
                    <button 
                        onClick={() => handleMiss(true)}
                        className="flex-[1.5] py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold active:bg-rose-300 transition-colors"
                    >+</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
