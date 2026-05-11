// User-scoped localStorage helper
// All user progress data is isolated per user email so admin/teacher
// cannot see or pollute student data

function getUserPrefix() {
  if (typeof window === 'undefined') return 'guest';
  try {
    const user = JSON.parse(localStorage.getItem('lms_user') || 'null');
    return user?.email?.replace(/[@.]/g, '_') || 'guest';
  } catch {
    return 'guest';
  }
}

export function uKey(key) {
  return `${getUserPrefix()}::${key}`;
}

export function getLS(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(uKey(key));
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setLS(key, value) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(uKey(key), JSON.stringify(value));
}

export function removeLS(key) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(uKey(key));
}

// Call this once after login/register to wipe old unnamespaced keys
// so that a new user never sees another user's progress
export function purgeOldUnprefixedData() {
  if (typeof window === 'undefined') return;
  const OLD_PREFIXES = ['progress_', 'exam_', 'note_'];
  const OLD_EXACT = ['achievements', 'streak_count', 'streak_last'];
  const toDelete = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    // Skip user-scoped keys (they contain '::')
    if (k.includes('::')) continue;
    // Skip global app keys
    if (k.startsWith('lms_') || k === 'theme') continue;
    // Remove old progress/exam/note/achievement keys
    if (OLD_PREFIXES.some(p => k.startsWith(p)) || OLD_EXACT.includes(k)) {
      toDelete.push(k);
    }
  }
  toDelete.forEach(k => localStorage.removeItem(k));
}
