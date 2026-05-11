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
