/**
 * Auth configuration.
 *
 * The backend team owns real authentication. This module only describes the
 * contract the UI expects, plus seeded demo identities so the pages are usable
 * before the API exists.
 *
 * SECURITY: the seeded password below is a published demo credential and is
 * intentionally visible in the UI. It is never written to storage.
 */

export const API_BASE = (import.meta.env.VITE_AUTH_API_BASE ?? '/api').replace(/\/$/, '')

export const SEED_ACCOUNTS = [
  {
    email: 'demo@lmis.gov.in',
    password: 'Demo@2026',
    name: 'Demo Recruiter',
    organisation: 'Gujarat Skill Council',
    role: 'recruiter',
  },
  {
    email: 'admin@lmis.gov.in',
    password: 'Admin@2026',
    name: 'Admin User',
    organisation: 'Ministry of Labour',
    role: 'admin',
  },
]

export const ROLES = [
  { id: 'recruiter', label: 'Recruiter / HR' },
  { id: 'employer', label: 'Employer' },
  { id: 'trainer', label: 'Training provider' },
  { id: 'official', label: 'Government official' },
  { id: 'admin', label: 'Administrator' },
]

/** Roles that may read workforce data beyond their own organisation. */
export const PRIVILEGED_ROLES = ['admin', 'official']
