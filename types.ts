export interface Subject {
  id: string;
  name: string;
  conductedClasses: number;
  classesAttended: number;
  fixedTotalClasses: number;
}

export interface DailyRecord {
  [subjectId: string]: 'present' | 'absent' | 'no-class';
}

export interface SemesterData {
  id: string;
  name: string;
  subjects: Subject[];
  dailyRecords: Record<string, DailyRecord>; // date string -> records
}

export interface AttendanceStats {
  percentage: number;
  classesMissed: number;
  status: 'safe' | 'warning' | 'danger';
  classesNeededToReachTarget: number;
  classesCanMiss: number;
}

export const TARGET_PERCENTAGE = 80;
