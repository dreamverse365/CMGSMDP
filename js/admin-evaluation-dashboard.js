(function () {
  'use strict';

  var state = { loading: false, courseId: 'ALL', initialized: false };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function formatNumber(value, digits) {
    if (value === null || value === undefined || value === '') return '—';
    return Number(value).toLocaleString('th-TH', {
      minimumFractionDigits: digits || 0,
      maximumFractionDigits: digits == null ? 2 : digits
    });
  }

  function formatDate(value) {
    var date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('th-TH', { dateStyle: 'short', timeStyle: 'short' }).format(date);
  }

  function installStyles() {
    if (document.getElementById('adminEvaluationStyles')) return;
    var style = document.createElement('style');
    style.id = 'adminEvaluationStyles';
    style.textContent = [
      '.aed{margin-top:26px}',
      '.aed *{box-sizing:border-box}',
      '.aed-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:14px}',
      '.aed-kicker{color:var(--brand,#ba2b2b);font-size:10px;font-weight:700;letter-spacing:.15em}',
      '.aed-title{margin:5px 0 0;color:var(--text,#222);font-size:20px;line-height:1.3}',
      '.aed-copy{margin:5px 0 0;color:var(--text-2,#666);font-size:12px}',
      '.aed-controls{display:flex;gap:8px;flex-wrap:wrap}',
      '.aed-select,.aed-refresh{min-height:42px;border:1px solid var(--border,rgba(25,25,25,.09));border-radius:10px;background:#fff;color:var(--text,#222);padding:8px 12px}',
      '.aed-select{min-width:230px}',
      '.aed-refresh{cursor:pointer;color:#fff;background:var(--brand,#ba2b2b);border-color:var(--brand,#ba2b2b);font-weight:600}',
      '.aed-refresh:disabled{opacity:.55;cursor:wait}',
      '.aed-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}',
      '.aed-kpi,.aed-panel{background:#fff;border:1px solid var(--border,rgba(25,25,25,.09));border-radius:16px;box-shadow:0 7px 24px rgba(25,25,25,.045)}',
      '.aed-kpi{padding:16px}',
      '.aed-kpi-label{color:var(--text-3,#999);font-size:10px;font-weight:700;letter-spacing:.06em}',
      '.aed-kpi-value{margin-top:8px;color:var(--text,#222);font-size:25px;font-weight:800}',
      '.aed-kpi-unit{font-size:11px;color:var(--text-3,#999);font-weight:500}',
      '.aed-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(300px,.75fr);gap:14px;margin-top:14px}',
      '.aed-panel{padding:18px;min-width:0}',
      '.aed-panel h3{margin:0;color:var(--text,#222);font-size:14px}',
      '.aed-panel-note{margin:4px 0 16px;color:var(--text-3,#999);font-size:10px}',
      '.aed-bars{display:grid;gap:13px}',
      '.aed-bar-head{display:flex;justify-content:space-between;gap:12px;color:var(--text-2,#666);font-size:11px}',
      '.aed-bar-head span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.aed-track{height:8px;margin-top:6px;border-radius:99px;background:var(--surface-2,#f1f1f1);overflow:hidden}',
      '.aed-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--brand,#ba2b2b),#d34a4a)}',
      '.aed-course-list{display:grid;gap:10px}',
      '.aed-course{padding:12px;border:1px solid var(--border,rgba(25,25,25,.09));border-radius:12px;background:var(--surface-2,#f1f1f1)}',
      '.aed-course-top{display:flex;justify-content:space-between;gap:10px}',
      '.aed-course-name{color:var(--text,#222);font-size:11px;font-weight:700}',
      '.aed-course-score{color:var(--brand,#ba2b2b);font-size:11px;font-weight:800}',
      '.aed-course-meta{margin-top:5px;color:var(--text-3,#999);font-size:9px}',
      '.aed-comments{margin-top:14px}',
      '.aed-table-wrap{overflow:auto;border:1px solid var(--border,rgba(25,25,25,.09));border-radius:14px;background:#fff}',
      '.aed-table{width:100%;min-width:760px;border-collapse:collapse}',
      '.aed-table th{padding:11px 12px;background:var(--surface-2,#f1f1f1);color:var(--text-3,#999);font-size:9px;text-align:left}',
      '.aed-table td{padding:12px;border-top:1px solid var(--border,rgba(25,25,25,.09));color:var(--text-2,#666);font-size:10px;vertical-align:top;line-height:1.55}',
      '.aed-comment{max-width:430px;white-space:normal}',
      '.aed-empty,.aed-error{padding:34px 16px;text-align:center;color:var(--text-3,#999);font-size:12px}',
      '.aed-error{color:var(--brand,#ba2b2b);background:rgba(186,43,43,.05);border-radius:12px}',
      '@media(max-width:900px){.aed-grid{grid-template-columns:1fr}.aed-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}',
      '@media(max-width:560px){.aed-head{align-items:stretch;flex-direction:column}.aed-controls{display:grid}.aed-select{min-width:0;width:100%}.aed-kpis{grid-template-columns:1fr 1fr}.aed-kpi{padding:13px}.aed-kpi-value{font-size:21px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function buildModule() {
    var dashboard = document.getElementById('dashboardView');
    if (!dashboard || document.getElementById('adminEvaluationDashboard')) return null;
    var section = document.createElement('section');
    section.className = 'aed';
    section.id = 'adminEvaluationDashboard';
    section.innerHTML =
      '<div class="aed-head">' +
        '<div><div class="aed-kicker">COURSE EVALUATION</div><h2 class="aed-title">สรุปผลการประเมินหลักสูตร</h2>' +
        '<p class="aed-copy">คะแนนเฉลี่ย อัตราการตอบ และความคิดเห็นจากผู้เข้าอบรม</p></div>' +
        '<div class="aed-controls"><select class="aed-select" id="aedCourse"><option value="ALL">ทุกหลักสูตร</option></select>' +
        '<button class="aed-refresh" id="aedRefresh" type="button">รีเฟรชข้อมูล</button></div>' +
      '</div><div id="aedContent"><div class="aed-empty">กำลังโหลดผลประเมิน...</div></div>';
    dashboard.appendChild(section);
    document.getElementById('aedCourse').addEventListener('change', function (event) {
      state.courseId = event.target.value;
      load();
    });
    document.getElementById('aedRefresh').addEventListener('click', load);
    return section;
  }

  function kpi(label, value, unit) {
    return '<div class="aed-kpi"><div class="aed-kpi-label">' + escapeHtml(label) + '</div>' +
      '<div class="aed-kpi-value">' + escapeHtml(value) + (unit ? ' <span class="aed-kpi-unit">' + escapeHtml(unit) + '</span>' : '') + '</div></div>';
  }

  function renderCourseComparison(courses) {
    if (!courses.length) return '<div class="aed-empty">ยังไม่มีข้อมูลการประเมิน</div>';
    return '<div class="aed-course-list">' + courses.map(function (course) {
      var score = course.avgRating5 != null ? formatNumber(course.avgRating5, 2) + '/5' :
        (course.avgRating10 != null ? formatNumber(course.avgRating10, 2) + '/10' : '—');
      return '<div class="aed-course"><div class="aed-course-top"><span class="aed-course-name">' +
        escapeHtml(course.courseId + ' — ' + course.courseName) + '</span><span class="aed-course-score">' + score + '</span></div>' +
        '<div class="aed-course-meta">ผู้ตอบ ' + formatNumber(course.respondents) + ' คน · Response Rate ' +
        (course.responseRate == null ? '—' : formatNumber(course.responseRate, 1) + '%') + ' · ความคิดเห็น ' + formatNumber(course.commentsCount) + '</div></div>';
    }).join('') + '</div>';
  }

  function renderQuestionBars(questions) {
    if (!questions.length) return '<div class="aed-empty">เลือกหลักสูตรเพื่อดูคะแนนเฉลี่ยรายหัวข้อ</div>';
    return '<div class="aed-bars">' + questions.map(function (q) {
      var percent = q.average == null || !q.maxScore ? 0 : Math.max(0, Math.min(100, q.average * 100 / q.maxScore));
      return '<div class="aed-bar"><div class="aed-bar-head"><span title="' + escapeHtml(q.question) + '">' +
        escapeHtml(q.question) + '</span><strong>' + (q.average == null ? '—' : formatNumber(q.average, 2) + '/' + formatNumber(q.maxScore)) +
        '</strong></div><div class="aed-track"><div class="aed-fill" style="width:' + percent.toFixed(1) + '%"></div></div></div>';
    }).join('') + '</div>';
  }

  function renderComments(comments) {
    if (!comments.length) return '<div class="aed-empty">ยังไม่มีความคิดเห็นแบบข้อความ</div>';
    return '<div class="aed-table-wrap"><table class="aed-table"><thead><tr><th>หลักสูตร</th><th>EMPLOYEE</th><th>หัวข้อ</th><th>ความคิดเห็น</th><th>วันที่</th></tr></thead><tbody>' +
      comments.map(function (item) {
        return '<tr><td>' + escapeHtml(item.courseId) + '</td><td>' + escapeHtml(item.empId || '—') + '</td><td>' +
          escapeHtml(item.question) + '</td><td class="aed-comment">' + escapeHtml(item.answer) + '</td><td>' + formatDate(item.submittedAt) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function updateCourseOptions(courses) {
    var select = document.getElementById('aedCourse');
    var current = state.courseId;
    select.innerHTML = '<option value="ALL">ทุกหลักสูตร</option>' + courses.map(function (course) {
      return '<option value="' + escapeHtml(course.courseId) + '">' + escapeHtml(course.courseId + ' — ' + course.courseName) + '</option>';
    }).join('');
    select.value = courses.some(function (c) { return c.courseId === current; }) || current === 'ALL' ? current : 'ALL';
  }

  function render(result) {
    updateCourseOptions(result.courses || []);
    var summary = result.summary || {};
    var content = document.getElementById('aedContent');
    var selectedAll = result.selectedCourseId === 'ALL';
    content.innerHTML =
      '<div class="aed-kpis">' +
        kpi(selectedAll ? 'UNIQUE RESPONDENTS' : 'RESPONDENTS', formatNumber(summary.respondents), 'คน') +
        kpi('SUBMISSIONS', formatNumber(summary.submissions), 'รายการ') +
        kpi('AVG RATING 1–5', formatNumber(summary.avgRating5, 2), summary.avgRating5 == null ? '' : '/ 5') +
        kpi('AVG RATING 0–10', formatNumber(summary.avgRating10, 2), summary.avgRating10 == null ? '' : '/ 10') +
      '</div>' +
      '<div class="aed-grid"><div class="aed-panel"><h3>' + (selectedAll ? 'เปรียบเทียบแต่ละหลักสูตร' : 'คะแนนเฉลี่ยรายหัวข้อ') + '</h3>' +
        '<p class="aed-panel-note">ข้อมูลอัปเดตจาก EvaluationResponses</p>' +
        (selectedAll ? renderCourseComparison(result.courses || []) : renderQuestionBars(result.questions || [])) + '</div>' +
        '<div class="aed-panel"><h3>ภาพรวมการตอบ</h3><p class="aed-panel-note">จำนวนผู้ตอบและความคิดเห็น</p>' +
          '<div class="aed-course-list">' +
            '<div class="aed-course"><div class="aed-course-top"><span class="aed-course-name">Response Rate</span><span class="aed-course-score">' +
              (summary.responseRate == null ? 'เลือกหลักสูตร' : formatNumber(summary.responseRate, 1) + '%') + '</span></div></div>' +
            '<div class="aed-course"><div class="aed-course-top"><span class="aed-course-name">ความคิดเห็นทั้งหมด</span><span class="aed-course-score">' + formatNumber(summary.commentsCount) + '</span></div></div>' +
          '</div></div></div>' +
      '<div class="aed-comments"><div class="aed-panel"><h3>ความคิดเห็นและข้อเสนอแนะล่าสุด</h3><p class="aed-panel-note">แสดงสูงสุด 100 รายการ</p>' +
        renderComments(result.comments || []) + '</div></div>';
  }

  async function load() {
    if (state.loading) return;
    var content = document.getElementById('aedContent');
    var button = document.getElementById('aedRefresh');
    if (!content || typeof window.api !== 'function') return;
    state.loading = true;
    button.disabled = true;
    button.textContent = 'กำลังโหลด...';
    content.innerHTML = '<div class="aed-empty">กำลังประมวลผลข้อมูลประเมิน...</div>';
    try {
      var result = await window.api('adminGetEvaluationSummary', { courseId: state.courseId });
      if (!result || !result.success) throw new Error(result && result.message ? result.message : 'ไม่สามารถโหลดข้อมูลได้');
      render(result);
    } catch (error) {
      content.innerHTML = '<div class="aed-error">' + escapeHtml(error.message || 'โหลดข้อมูลไม่สำเร็จ') + '</div>';
    } finally {
      state.loading = false;
      button.disabled = false;
      button.textContent = 'รีเฟรชข้อมูล';
    }
  }

  function init() {
    if (state.initialized) return;
    installStyles();
    if (!buildModule()) return;
    state.initialized = true;
    load();
  }

  window.AdminEvaluationDashboard = { init: init, refresh: load };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
