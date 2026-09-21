// ============================================================
//  CMG SMDP — Global Config
// ============================================================
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbx3prMp9Zl_owDdD_47ftD3_zIRRL2shG2JT_Ihwk4eOv5nUuSbXS6z97ZUIeekDonbng/exec',  // <-- ใส่ GAS Web App URL หลัง deploy
  PROJECT_NAME: 'CMG STORE MANAGER',
  PROJECT_SUBTITLE: 'DEVELOPMENT PROGRAM',
  SESSION_KEY: 'cmg_smdp_session',
  SESSION_EXPIRE_HOURS: 12
};

// ---------- Session Helpers ----------
const Session = {
  save(userData) {
    const payload = {
      ...userData,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(payload));
  },

  get() {
    const raw = localStorage.getItem(CONFIG.SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const loginTime = new Date(data.loginTime);
    const now = new Date();
    const hours = (now - loginTime) / (1000 * 60 * 60);
    if (hours > CONFIG.SESSION_EXPIRE_HOURS) {
      this.clear();
      return null;
    }
    return data;
  },

  clear() {
    localStorage.removeItem(CONFIG.SESSION_KEY);
  },

  require() {
    const s = this.get();
    if (!s) {
      window.location.href = 'index.html';
      return null;
    }
    return s;
  }
};

// ---------- API Helper ----------
async function api(action, body = {}) {
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      body: JSON.stringify({ action, ...body })
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่' };
  }
}

// ---------- Toast Notification ----------
function showToast(message, type = 'info', duration = 3000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast--show'));
  setTimeout(() => {
    toast.classList.remove('toast--show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
