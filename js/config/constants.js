/* ============================================
   CONSTANTS.JS - Application Constants
   CD-1 Rezoning Application Checker
   ============================================ */

export const APP_VERSION = '1.0.0';
export const APP_NAME = 'CD-1 Rezoning Application Checker';
export const CITY_NAME = 'City of Vancouver';

// Storage Keys
export const STORAGE_KEYS = {
  CURRENT_PROJECT: 'rezoning_current_project',
  RECENT_PROJECTS: 'rezoning_recent_projects',
  USER_PREFERENCES: 'rezoning_user_preferences',
  AUTO_SAVE: 'rezoning_auto_save'
};

// Requirement Status
export const STATUS = {
  COMPLETE: 'complete',
  IN_PROGRESS: 'in-progress',
  MISSING: 'missing',
  NOT_APPLICABLE: 'not-applicable'
};

// Requirement Criteria
export const CRITERIA = {
  REQUIRED: 'REQUIRED',
  CONDITIONAL: 'CONDITIONAL',
  OPTIONAL: 'OPTIONAL'
};

// Categories
export const CATEGORIES = {
  FORMS_FEES: 'Application Forms and Fees',
  PROPERTY_INFO: 'Property Information',
  SITE_PLANS: 'Site Plans and Design Package',
  STUDIES: 'Studies, Reports and Assessments',
  ADDITIONAL_INFO: 'Additional Information',
  MAY_REQUEST: 'May be Requested Later'
};

// Location Options
export const LOCATIONS = [
  'Downtown',
  'Broadway Plan Area',
  'Transit-Oriented Area',
  'Downtown Eastside - CBDA',
  'Cambie Corridor',
  'Other'
];

// Thresholds
export const THRESHOLDS = {
  LARGE_SITE_AREA: 8000, // sqm
  LARGE_SITE_FLOOR_AREA: 45000, // sqm
  PUBLIC_ART_FLOOR_AREA: 9290, // sqm
  HIGHER_BUILDING_HEIGHT: 11, // meters
  CBA_FLOOR_AREA: 45000 // sqm
};

// Auto-save interval (milliseconds)
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Max projects to keep in recent list
export const MAX_RECENT_PROJECTS = 10;

// Status Icons
export const STATUS_ICONS = {
  [STATUS.COMPLETE]: '✓',
  [STATUS.IN_PROGRESS]: '⚠️',
  [STATUS.MISSING]: '✗',
  [STATUS.NOT_APPLICABLE]: '⭘'
};

// Status Colors
export const STATUS_COLORS = {
  [STATUS.COMPLETE]: '#28A745',
  [STATUS.IN_PROGRESS]: '#FFC107',
  [STATUS.MISSING]: '#DC3545',
  [STATUS.NOT_APPLICABLE]: '#6C757D'
};

// Criteria Icons
export const CRITERIA_ICONS = {
  [CRITERIA.REQUIRED]: '🔴',
  [CRITERIA.CONDITIONAL]: '🟡',
  [CRITERIA.OPTIONAL]: '🟢'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_FULL: 'MMMM DD, YYYY',
  ISO: 'YYYY-MM-DD',
  TIMESTAMP: 'YYYY-MM-DD HH:mm:ss'
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_NUMBER: 'Please enter a valid number',
  INVALID_EMAIL: 'Please enter a valid email address',
  MIN_VALUE: (min) => `Value must be at least ${min}`,
  MAX_VALUE: (max) => `Value must be at most ${max}`,
  FILE_TOO_LARGE: (max) => `File size must be less than ${max}MB`,
  INVALID_FILE_TYPE: (types) => `File type must be one of: ${types.join(', ')}`
};

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'],
  MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ]
};

// Profiler Steps
export const PROFILER_STEPS = [
  { id: 'site-details', name: 'Site Details', number: 1 },
  { id: 'location', name: 'Location', number: 2 },
  { id: 'existing-uses', name: 'Existing Uses', number: 3 },
  { id: 'proposed-uses', name: 'Proposed Uses', number: 4 },
  { id: 'summary', name: 'Summary', number: 5 }
];

// Contact Information
export const CONTACTS = {
  REZONING_CENTER: 'rezoning@vancouver.ca',
  TRP: 'trp@vancouver.ca',
  PUBLIC_ART: 'publicart@vancouver.ca',
  UTILITIES: 'utilities.servicing@vancouver.ca'
};

// External Links
export const EXTERNAL_LINKS = {
  CITY_WEBSITE: 'https://vancouver.ca',
  REZONING_INFO: 'https://vancouver.ca/rezoning',
  FORMS: 'https://vancouver.ca/rezoning-forms',
  POLICIES: 'https://vancouver.ca/rezoning-policies',
  BYLAWS: 'https://vancouver.ca/bylaws'
};

// Priority Levels
export const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Warning Types
export const WARNING_TYPES = {
  CONSISTENCY: 'consistency',
  DISCREPANCY: 'discrepancy',
  TIMING: 'timing',
  DEPENDENCY: 'dependency'
};

// Suggestion Types
export const SUGGESTION_TYPES = {
  PROACTIVE: 'proactive',
  TIMING: 'timing',
  COST_SAVING: 'cost-saving',
  EFFICIENCY: 'efficiency'
};
