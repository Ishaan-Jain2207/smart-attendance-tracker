import React, { useState } from 'react';
import { Subject } from '../types';

interface ManageSubjectsProps {
  subjects: Subject[];
  onSave: (subjects: Subject[]) => void;
  onClose: () => void;
}

export const ManageSubjects: React.FC<ManageSubjectsProps> = ({ subjects, onSave, onClose }) => {
  const [localSubjects, setLocalSubjects] = useState<Subject[]>(JSON.parse(JSON.stringify(subjects)));
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectTotal, setNewSubjectTotal] = useState(40);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subject? Attendance data will be lost.')) {
      setLocalSubjects(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleUpdate = (id: string, field: keyof Subject, value: string | number) => {
    setLocalSubjects(prev => prev.map(s => {
      if (s.id !== id) return s;
      
      const updated = { ...s, [field]: value };
      
      // Validation: Conducted cannot exceed Fixed Total
      if (field === 'fixedTotalClasses') {
        const newFixed = Number(value);
        if (s.conductedClasses > newFixed) updated.conductedClasses = newFixed;
        if (s.classesAttended > newFixed) updated.classesAttended = newFixed;
      }
      return updated;
    }));
  };

  const handleAdd = () => {
    if (!newSubjectName.trim()) return;
    const newSub: Subject = {
      id: Date.now().toString(),
      name: newSubjectName,
      fixedTotalClasses: newSubjectTotal,
      conductedClasses: 0,
      classesAttended: 0
    };
    setLocalSubjects([...localSubjects, newSub]);
    setNewSubjectName('');
    setNewSubjectTotal(40);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Manage Subjects</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {localSubjects.map(sub => (
            <div key={sub.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 border border-slate-200 rounded-xl bg-slate-50">
              <input 
                value={sub.name}
                onChange={e => handleUpdate(sub.id, 'name', e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Subject Name"
              />
              <div className="flex items-center gap-2">
                 <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Fixed Total:</span>
                 <input 
                    type="number"
                    value={sub.fixedTotalClasses}
                    onChange={e => handleUpdate(sub.id, 'fixedTotalClasses', Number(e.target.value))}
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    min={1}
                 />
              </div>
              <button 
                onClick={() => handleDelete(sub.id)}
                className="text-rose-500 hover:text-rose-700 p-2"
                title="Delete Subject"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
          <h3 className="text-sm font-bold text-indigo-800 mb-3">Add New Subject</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              value={newSubjectName}
              onChange={e => setNewSubjectName(e.target.value)}
              placeholder="Subject Name"
              className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input 
              type="number"
              value={newSubjectTotal}
              onChange={e => setNewSubjectTotal(Number(e.target.value))}
              placeholder="Total"
              className="w-full sm:w-24 px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button 
              onClick={handleAdd}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={() => { onSave(localSubjects); onClose(); }} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  );
};
