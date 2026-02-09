import React, { useState, useEffect } from 'react';
import { INITIAL_SUBJECTS, INITIAL_SEMESTER_ID, INITIAL_SEMESTER_NAME } from './constants';
import { Subject, SemesterData, DailyRecord } from './types';
import { SubjectCard } from './components/SubjectCard';
import { DailyDashboard } from './components/DailyDashboard';
import { ManageSubjects } from './components/ManageSubjects';

const STORAGE_KEY = 'attendance-data-v2';
const LEGACY_STORAGE_KEY = 'attendance-data-v1';

const App: React.FC = () => {
  const [data, setData] = useState<Record<string, SemesterData>>({});
  const [currentSemesterId, setCurrentSemesterId] = useState<string>(INITIAL_SEMESTER_ID);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isNewSemModalOpen, setIsNewSemModalOpen] = useState(false);
  const [newSemName, setNewSemName] = useState('');
  const [copyFromId, setCopyFromId] = useState<string>('');

  // Initialization & Migration
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(parsed);
        // Default to first key if current invalid
        if (!parsed[currentSemesterId]) {
           const firstKey = Object.keys(parsed)[0];
           if (firstKey) setCurrentSemesterId(firstKey);
        }
      } else {
        // Migration Check
        const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
        let initialSubjects = INITIAL_SUBJECTS;
        
        if (legacy) {
          try {
             const legacySubjects = JSON.parse(legacy);
             // Map legacy (totalClasses was conducted) to new structure
             initialSubjects = legacySubjects.map((s: any) => ({
                 ...s,
                 conductedClasses: s.totalClasses,
                 // Try to match fixed total from CONSTANTS if id matches, else default
                 fixedTotalClasses: INITIAL_SUBJECTS.find(is => is.id === s.id)?.fixedTotalClasses || 60
             }));
          } catch (e) { console.error("Legacy migration failed", e); }
        }

        const initialData: SemesterData = {
          id: INITIAL_SEMESTER_ID,
          name: INITIAL_SEMESTER_NAME,
          subjects: initialSubjects,
          dailyRecords: {}
        };
        setData({ [INITIAL_SEMESTER_ID]: initialData });
      }
    } catch (e) {
      console.error('Init failed', e);
    }
  }, []);

  // Persistence
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const currentSemester = data[currentSemesterId];

  const handleUpdateSubject = (subId: string, newAttended: number, newConducted: number) => {
    if (!currentSemester) return;
    
    setData(prev => ({
      ...prev,
      [currentSemesterId]: {
        ...prev[currentSemesterId],
        subjects: prev[currentSemesterId].subjects.map(s => 
          s.id === subId ? { ...s, classesAttended: newAttended, conductedClasses: newConducted } : s
        )
      }
    }));
  };

  const handleUpdateDailyRecord = (date: string, subId: string, status: 'present' | 'absent' | 'no-class') => {
    if (!currentSemester) return;

    const currentRecord = currentSemester.dailyRecords[date]?.[subId] || 'no-class';
    
    // Do nothing if no change
    if (currentRecord === status) return;

    // Calculate delta for counts
    let attendDelta = 0;
    let conductDelta = 0;

    // Revert old status
    if (currentRecord === 'present') { attendDelta--; conductDelta--; }
    else if (currentRecord === 'absent') { conductDelta--; }
    
    // Apply new status
    if (status === 'present') { attendDelta++; conductDelta++; }
    else if (status === 'absent') { conductDelta++; }

    setData(prev => {
      const semester = prev[currentSemesterId];
      const subject = semester.subjects.find(s => s.id === subId);
      
      if (!subject) return prev;

      // Ensure we don't exceed limits or go below zero
      const newConducted = Math.min(subject.fixedTotalClasses, Math.max(0, subject.conductedClasses + conductDelta));
      const newAttended = Math.min(newConducted, Math.max(0, subject.classesAttended + attendDelta));

      return {
        ...prev,
        [currentSemesterId]: {
          ...semester,
          subjects: semester.subjects.map(s => s.id === subId ? { ...s, conductedClasses: newConducted, classesAttended: newAttended } : s),
          dailyRecords: {
            ...semester.dailyRecords,
            [date]: {
              ...(semester.dailyRecords[date] || {}),
              [subId]: status
            }
          }
        }
      };
    });
  };

  const handleCreateSemester = () => {
    if (!newSemName) return;
    const newId = `sem-${Date.now()}`;
    let newSubjects: Subject[] = [];

    if (copyFromId && data[copyFromId]) {
      newSubjects = data[copyFromId].subjects.map(s => ({
        ...s,
        conductedClasses: 0,
        classesAttended: 0
      }));
    }

    setData(prev => ({
      ...prev,
      [newId]: {
        id: newId,
        name: newSemName,
        subjects: newSubjects,
        dailyRecords: {}
      }
    }));
    setCurrentSemesterId(newId);
    setIsNewSemModalOpen(false);
    setNewSemName('');
  };

  const handleDeleteSemester = (id: string) => {
    if (Object.keys(data).length <= 1) {
      alert("Cannot delete the only semester.");
      return;
    }
    if (confirm("Delete this semester? This cannot be undone.")) {
      const newData = { ...data };
      delete newData[id];
      setData(newData);
      if (currentSemesterId === id) {
        setCurrentSemesterId(Object.keys(newData)[0]);
      }
    }
  };

  const handleResetCurrent = () => {
     if (confirm("Reset current semester data to defaults? This will clear all daily records and reset counts.")) {
        setData(prev => ({
           ...prev,
           [currentSemesterId]: {
              ...prev[currentSemesterId],
              subjects: prev[currentSemesterId].subjects.map(s => ({ ...s, conductedClasses: 0, classesAttended: 0 })),
              dailyRecords: {}
           }
        }));
     }
  };

  const handleSaveSubjects = (updatedSubjects: Subject[]) => {
    setData(prev => ({
      ...prev,
      [currentSemesterId]: {
        ...prev[currentSemesterId],
        subjects: updatedSubjects
      }
    }));
  };

  if (!currentSemester) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      {/* Header & Controls */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Smart Attendance Tracker</h1>
            <p className="text-xs text-slate-500">{new Date().toDateString()}</p>
          </div>
          
          <div className="flex items-center gap-3">
             <select 
               value={currentSemesterId} 
               onChange={(e) => setCurrentSemesterId(e.target.value)}
               className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-700"
             >
                {Object.values(data).map(sem => (
                   <option key={sem.id} value={sem.id}>{sem.name}</option>
                ))}
             </select>
             <button 
                onClick={() => setIsNewSemModalOpen(true)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                title="New Semester"
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
             </button>
             <button 
                onClick={() => setIsManageModalOpen(true)}
                className="text-xs font-medium px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
             >
                Edit Subjects
             </button>
             <button 
                onClick={handleResetCurrent}
                className="text-xs font-medium text-rose-400 hover:text-rose-600 transition-colors"
             >
                Reset
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentSemester.subjects.map(sub => (
            <SubjectCard 
              key={sub.id} 
              subject={sub} 
              onUpdate={handleUpdateSubject} 
            />
          ))}
        </div>

        <DailyDashboard 
           subjects={currentSemester.subjects} 
           records={currentSemester.dailyRecords} 
           onUpdateRecord={handleUpdateDailyRecord} 
        />

        {/* Instructions */}
        <div className="mt-12 p-6 bg-slate-100 rounded-2xl text-slate-600 text-sm">
          <h3 className="font-bold text-slate-800 mb-2">How it works</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Multiple Semesters:</strong> Switch between semesters using the dropdown at the top. Create new ones as you progress.</li>
            <li><strong>Data Privacy:</strong> All data is stored locally on your device.</li>
            <li><strong>Safe/Warning Logic:</strong> "Safe" means you can miss classes and still end the semester above 80% (based on fixed total). "Warning" means you must attend consecutively to recover.</li>
            <li><strong>Daily Log:</strong> Use the calendar view to track daily attendance. This syncs with your totals.</li>
          </ul>
        </div>
      </main>

      {/* Modals */}
      {isManageModalOpen && (
         <ManageSubjects 
            subjects={currentSemester.subjects}
            onSave={handleSaveSubjects}
            onClose={() => setIsManageModalOpen(false)}
         />
      )}

      {isNewSemModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Start New Semester</h2>
              <input 
                 className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-4" 
                 placeholder="Semester Name (e.g. Sem V)" 
                 value={newSemName}
                 onChange={e => setNewSemName(e.target.value)}
              />
              <div className="mb-6">
                 <label className="text-sm text-slate-500 block mb-2">Copy subjects from:</label>
                 <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    value={copyFromId}
                    onChange={e => setCopyFromId(e.target.value)}
                 >
                    <option value="">Start Empty</option>
                    {Object.values(data).map(s => (
                       <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                 </select>
              </div>
              <div className="flex justify-end gap-3">
                 <button onClick={() => setIsNewSemModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                 <button onClick={handleCreateSemester} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
