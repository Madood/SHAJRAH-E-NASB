// ═══════════════════════════════════════════════
// SHAJRA APP — Configuration Constants
// ═══════════════════════════════════════════════

export const STORAGE_KEY = 'shajra_v7'

export const NASL_CONFIG = [
  { n: 1,  ur: 'نسل اول',    eng: '1st',  color: '#c8a032' },
  { n: 2,  ur: 'نسل دوم',    eng: '2nd',  color: '#cc2222' },
  { n: 3,  ur: 'نسل سوم',    eng: '3rd',  color: '#a08000' },
  { n: 4,  ur: 'نسل چہارم',  eng: '4th',  color: '#1640a0' },
  { n: 5,  ur: 'نسل پنجم',   eng: '5th',  color: '#186018' },
  { n: 6,  ur: 'نسل ششم',    eng: '6th',  color: '#7a2090' },
  { n: 7,  ur: 'نسل ہفتم',   eng: '7th',  color: '#107878' },
  { n: 8,  ur: 'نسل ہشتم',   eng: '8th',  color: '#904020' },
  { n: 9,  ur: 'نسل نہم',    eng: '9th',  color: '#505050' },
  { n: 10, ur: 'نسل دہم',    eng: '10th', color: '#303030' },
]

export const BRANCH_COLORS = {
  root:    { border: '#c8a032', bg: 'linear-gradient(145deg,#2a5a2a,#1a3a1a)', text: '#f0dfa0', sub: '#c8a032' },
  samad:   { border: '#cc2222', bg: 'linear-gradient(145deg,#fff8f8,#ffeaea)', text: '#2a0505', sub: '#991818' },
  ahmad:   { border: '#a08000', bg: 'linear-gradient(145deg,#fffef0,#fff8d0)', text: '#2a2000', sub: '#7a6000' },
  hassan:  { border: '#1640a0', bg: 'linear-gradient(145deg,#f6f9ff,#e8f0ff)', text: '#08103a', sub: '#1030780' },
  khwaja:  { border: '#186018', bg: 'linear-gradient(145deg,#f5fff5,#e8f8e8)', text: '#052505', sub: '#186018' },
  default: { border: '#406040', bg: 'linear-gradient(145deg,#f8fbf8,#eef5ee)', text: '#202820', sub: '#406040' },
}

export const BRANCH_OPTIONS = [
  { value: 'samad',   label: 'Noor Samad Branch (Red)'   },
  { value: 'ahmad',   label: 'Noor Ahmad Branch (Gold)'  },
  { value: 'hassan',  label: 'Noor Hassan Branch (Blue)' },
  { value: 'khwaja',  label: 'Khwaja Silsila (Green)'    },
  { value: 'default', label: 'Other'                     },
]

export const LEGEND_ITEMS = [
  { color: '#c8a032', label: 'Progenitor (Root)'         },
  { color: '#cc2222', label: 'نسل صمد — Noor Samad Branch' },
  { color: '#a08000', label: 'نسل احمد — Noor Ahmad Branch' },
  { color: '#1640a0', label: 'نسل حسن — Noor Hassan Branch' },
  { color: '#186018', label: 'خواجہ سلسلہ — Khwaja Silsila' },
  { color: '#ff6600', label: 'Search Match'               },
]
