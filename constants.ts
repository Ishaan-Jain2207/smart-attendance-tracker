import { Subject } from './types';

export const INITIAL_SEMESTER_ID = 'sem-4-spring-2026';
export const INITIAL_SEMESTER_NAME = 'Semester IV (Spring 2026)';

// Initial counts derived from PDF:
// Web Prog: 19 conducted, 16 attended (A: 1, 74, 93)
// ML: 26 conducted, 24 attended (A: 2, 14)
// Stats: 23 conducted, 20 attended (A: 3, 4, 5)
// Intro: 25 conducted, 24 attended (A: 56, NU: 124 count as P)
// DBMS: 19 conducted, 15 attended (A: 37, 43, 64, 113)
// Data Handling: 16 conducted, 14 attended (A: 54, 55, NU: 127, 128 count as P)

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'intro-dsi',
    name: 'Intro to Data, Signal & Image A',
    conductedClasses: 25,
    classesAttended: 24,
    fixedTotalClasses: 75
  },
  {
    id: 'web-prog',
    name: 'Web Programming',
    conductedClasses: 19,
    classesAttended: 16,
    fixedTotalClasses: 60
  },
  {
    id: 'data-viz',
    name: 'Data Handling and Visualization',
    conductedClasses: 16,
    classesAttended: 14,
    fixedTotalClasses: 45
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    conductedClasses: 26,
    classesAttended: 24,
    fixedTotalClasses: 75
  },
  {
    id: 'stats',
    name: 'Statistical Methods',
    conductedClasses: 23,
    classesAttended: 20,
    fixedTotalClasses: 60
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    conductedClasses: 19,
    classesAttended: 15,
    fixedTotalClasses: 60
  }
];
