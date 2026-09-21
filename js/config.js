// ============================================================
//  CMG SMDP โ€” Global Config
// ============================================================
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbx3prMp9Zl_owDdD_47ftD3_zIRRL2shG2JT_Ihwk4eOv5nUuSbXS6z97ZUIeekDonbng/exec',
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

    try {
      const data = JSON.parse(raw);
      const loginTime = new Date(data.loginTime);
      const now = new Date();
      const hours = (now - loginTime) / (1000 * 60 * 60);

      if (!data.loginTime || Number.isNaN(loginTime.getTime()) ||
          hours > CONFIG.SESSION_EXPIRE_HOURS) {
        this.clear();
        return null;
      }

      return data;
    } catch (error) {
      this.clear();
      return null;
    }
  },

  clear() {
    localStorage.removeItem(CONFIG.SESSION_KEY);
  },

  require() {
    const session = this.get();

    if (!session) {
      const isInsidePages = window.location.pathname
        .toLowerCase()
        .includes('/pages/');

      window.location.replace(
        isInsidePages ? '../index.html' : 'index.html'
      );

      return null;
    }

    return session;
  }
};

// ---------- API Helper ----------
async function api(action, body = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      body: JSON.stringify({ action, ...body }),
      signal: controller.signal
    });

    if (!response.ok) {
      return {
        success: false,
        message: `เธฃเธฐเธเธเธ•เธญเธเธเธฅเธฑเธเธเธดเธ”เธเธฅเธฒเธ” (${response.status})`
      };
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error.name === 'AbortError'
        ? 'เธฃเธฐเธเธเนเธเนเน€เธงเธฅเธฒเธ•เธญเธเธเธฅเธฑเธเธเธฒเธเน€เธเธดเธเนเธ เธเธฃเธธเธ“เธฒเธฅเธญเธเนเธซเธกเน'
        : 'เน€เธเธทเนเธญเธกเธ•เนเธญเธฃเธฐเธเธเนเธกเนเนเธ”เน เธเธฃเธธเธ“เธฒเธฅเธญเธเนเธซเธกเน'
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------- Toast Notification ----------
function showToast(message, type = 'info', duration = 3000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast--show'));

  setTimeout(() => {
    toast.classList.remove('toast--show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
