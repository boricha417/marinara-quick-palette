/* ───────── 퀵 팔레트 v1.3.10 ─────────
   채팅 입력창의 파일 첨부 버튼을 + 메뉴로 교체.
   - 대사 따옴표("") / 나레이션(**) 빠른 입력 (문단에 홀수 개면 하나만 추가)
   - 이미지 추가 (마리나라 순정 파일 첨부 그대로)
   - 메모: 자주 쓰는 문구 보관함 (marinara.storage + localStorage 미러)
   - 북마크: 턴 북마크 확장의 런처 버튼을 대신 눌러줌
   - 각 항목 체크박스 → 입력창 상단에 붙는 미니 탭으로 상시 노출
   칩은 전체 폭 투명 독(dock) 안에 넣는다: 확장 서랍의 자동 수집이
   body 직계 자식 중 14~170px 크기의 fixed 요소만 담아가므로,
   화면 폭 전체를 차지하는 래퍼는 수집 대상에서 자연히 제외된다. */
(() => {
  "use strict";

  const STORAGE_KEY = "qp-state-v1";
  const SCAN_MS = 700;
  const SHELL_SELECTOR = ".marinara-chat-input-shell";
  const COMPOSER_SELECTOR = 'textarea[data-chat-composer="true"], textarea.mari-chat-input-textarea';
  const TB_LAUNCHER_SELECTOR = ".tb-floating-launcher, .tb-topbar-launcher";
  const TRANSCRIPT_SELECTOR = "[data-chat-scroll], .mari-messages-scroll";

  const SVG_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  const SVG_IMAGE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
  const SVG_NOTE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M9 13h6M9 17h4"/></svg>';
  const SVG_BOOKMARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>';
  const SVG_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';
  const SVG_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  const SVG_PEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>';
  const SVG_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 10v7M14 10v7"/></svg>';
  const SVG_COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const SVG_INSERT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M12 3v12M7 10l5 5 5-5"/></svg>';
  const SVG_CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  const SVG_STAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.3.9-4.5 4.3 1 6.2-5.5-3-5.5 3 1-6.2L3 9.5l6.3-.9z"/></svg>';
  // 나레이션 * : 폰트 메트릭에 따라 위치가 흔들리는 문자 대신 SVG로 그려 항상 정중앙에 온다
  const SVG_ASTERISK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M12 5v14M5.9 8.5l12.2 7M18.1 8.5 5.9 15.5"/></svg>';
  const SVG_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>';
  const SVG_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  const SVG_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>';

  const state = {
    chips: { quote: false, narration: false, image: false, memo: false, bookmark: false },
    chipOrder: [], // 체크박스를 누른 순서 = 탭이 붙는 순서 (기본은 아무것도 없음)
    memos: [], // { id, title, content, pinned, createdAt, updatedAt } — 배열 순서가 곧 표시 순서
  };

  const cleanupFns = [];
  let scanTimer = null;
  let menuEl = null;
  let menuOpen = false;
  let menuAnchor = null;
  let chipsEl = null;
  let chipsRow = null;
  let modalEl = null;
  let toastEl = null;
  let toastTimer = 0;
  let shellResizeObserver = null;

  // 메모 모달 내부 상태
  const modal = { editor: null, expanded: new Set(), search: "", searchOpen: false, confirmDelete: null };

  // ---------- 저장/복원 ----------
  function parseRecord(raw) {
    if (!raw) return null;
    try {
      const v = typeof raw === "string" ? JSON.parse(raw) : raw;
      return v && typeof v === "object" ? v : null;
    } catch { return null; }
  }

  function normalizeMemo(m) {
    if (!m || typeof m !== "object") return null;
    const content = String(m.content || "");
    if (!content.trim() && !String(m.title || "").trim()) return null;
    return {
      id: String(m.id || `m-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`),
      title: String(m.title || "").slice(0, 200),
      content,
      pinned: Boolean(m.pinned),
      createdAt: typeof m.createdAt === "string" ? m.createdAt : new Date().toISOString(),
      updatedAt: typeof m.updatedAt === "string" ? m.updatedAt : new Date().toISOString(),
    };
  }

  // 고정 메모가 항상 앞에 오도록, 그룹 내 상대 순서는 유지한 채 재배치
  function partitionMemos() {
    state.memos = [...state.memos.filter((m) => m.pinned), ...state.memos.filter((m) => !m.pinned)];
  }

  function applySaved(saved) {
    if (!saved) return;
    if (saved.chips && typeof saved.chips === "object") {
      for (const key of Object.keys(state.chips)) {
        if (typeof saved.chips[key] === "boolean") state.chips[key] = saved.chips[key];
      }
    }
    if (Array.isArray(saved.chipOrder)) {
      const valid = saved.chipOrder.filter(
        (id) => typeof id === "string" && Object.prototype.hasOwnProperty.call(state.chips, id),
      );
      state.chipOrder = [...new Set(valid)].filter((id) => state.chips[id]);
    } else {
      state.chipOrder = [];
    }
    // 구버전 저장분 등으로 켜져 있는데 순서에 없는 항목은 뒤에 붙인다
    for (const id of Object.keys(state.chips)) {
      if (state.chips[id] && !state.chipOrder.includes(id)) state.chipOrder.push(id);
    }
    if (Array.isArray(saved.memos)) {
      state.memos = saved.memos.map(normalizeMemo).filter(Boolean);
      // 수동 정렬 도입(1.3.0) 이전 저장분은 기존 표시 순서(최신순)로 한 번 정렬해 준다
      if (saved.memoOrdering !== "manual") {
        state.memos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      }
      partitionMemos();
    }
  }

  async function loadState() {
    let saved = null;
    try { saved = parseRecord(localStorage.getItem(STORAGE_KEY)); } catch {}
    try {
      if (typeof marinara !== "undefined" && marinara?.storage?.get) {
        const ext = parseRecord(await marinara.storage.get());
        const inner = ext && parseRecord(ext[STORAGE_KEY]);
        if (inner) saved = inner;
      }
    } catch {}
    applySaved(saved);
  }

  function persist() {
    const snapshot = {
      chips: { ...state.chips },
      chipOrder: [...state.chipOrder],
      memos: state.memos,
      memoOrdering: "manual",
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch {}
    // 서버 저장(다른 기기 동기화)이 거절되면 알린다. 전에는 결과를 보지 않아, 예컨대 메모가 1MB 한도를
    // 넘어 거절돼도 이 브라우저 사본만 갱신된 채 조용히 지나가 다른 기기에서 옛 메모가 보였다.
    try {
      if (typeof marinara !== "undefined" && marinara?.storage?.patch) {
        marinara.storage.patch({ [STORAGE_KEY]: snapshot }).then(null, (error) => {
          console.warn("[퀵 팔레트] 서버 저장 실패", error);
          toast("서버에 저장하지 못했어요. 이 브라우저에만 남아 있어요");
        });
      }
    } catch {}
  }

  // ---------- 공용 헬퍼 ----------
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function iconSpan(svg, className) {
    const span = el("span", className || "qp-icon");
    span.innerHTML = svg;
    return span;
  }

  // 버튼을 누르는 순간 포커스가 버튼으로 옮겨가면 입력창이 포커스를 잃고
  // 모바일 키보드가 내려간다. pointerdown 기본 동작(포커스 이동)만 막으면
  // 클릭은 그대로 발생하면서 입력창 포커스와 키보드가 유지된다.
  function keepComposerFocus(button) {
    button.addEventListener("pointerdown", (event) => event.preventDefault());
  }

  function visibleShells() {
    return [...document.querySelectorAll(SHELL_SELECTOR)].filter((shell) => {
      // 채팅방을 나가도 DOM에 남아 있을 수 있으므로, 실제로 화면 안에 보이는지까지 확인
      if (typeof shell.checkVisibility === "function" && !shell.checkVisibility()) return false;
      const rect = shell.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return false;
      return (
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth
      );
    });
  }

  function activeShell() {
    return visibleShells()[0] || null;
  }

  // 채팅방 목록 화면에도 입력창이 떠 있을 수 있으므로,
  // 메시지 대화 영역이 실제로 보일 때만 "채팅방 안"으로 판단한다
  function transcriptVisible() {
    return [...document.querySelectorAll(TRANSCRIPT_SELECTOR)].some((node) => {
      const rect = node.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth
      );
    });
  }

  function activeComposer() {
    const shell = activeShell();
    return shell ? shell.querySelector(COMPOSER_SELECTOR) : null;
  }

  function toast(message) {
    if (!toastEl) {
      toastEl = el("div", "qp-toast");
      document.body.append(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add("qp-toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl?.classList.remove("qp-toast--show"), 2200);
  }

  function formatDate(iso) {
    try {
      return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric", month: "long", day: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
      }).format(new Date(iso));
    } catch { return ""; }
  }

  // ---------- 입력창 텍스트 삽입 ----------
  function setComposerValue(textarea, nextValue, cursor) {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    if (setter) setter.call(textarea, nextValue);
    else textarea.value = nextValue;
    textarea.focus();
    try { textarea.setSelectionRange(cursor, cursor); } catch {}
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function requireComposer() {
    const textarea = activeComposer();
    if (!textarea || textarea.disabled) {
      toast("채팅방을 먼저 열어주세요");
      return null;
    }
    return textarea;
  }

  // 마커(" 또는 *) 삽입: 선택 영역이 있으면 감싸고,
  // 없으면 현재 문단의 마커 개수가 홀수일 때 하나만(닫기), 짝수면 쌍으로 추가.
  function insertMarker(marker) {
    const textarea = requireComposer();
    if (!textarea) return;
    const value = textarea.value;
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? start;

    let nextValue;
    let cursor;
    if (start !== end) {
      const selected = value.slice(start, end);
      nextValue = `${value.slice(0, start)}${marker}${selected}${marker}${value.slice(end)}`;
      cursor = end + marker.length * 2;
    } else {
      const paragraphStart = value.lastIndexOf("\n", start - 1) + 1;
      let paragraphEnd = value.indexOf("\n", start);
      if (paragraphEnd === -1) paragraphEnd = value.length;
      const paragraph = value.slice(paragraphStart, paragraphEnd);
      const count = paragraph.split(marker).length - 1;
      if (count % 2 === 1) {
        nextValue = `${value.slice(0, start)}${marker}${value.slice(end)}`;
        cursor = start + marker.length;
      } else {
        nextValue = `${value.slice(0, start)}${marker}${marker}${value.slice(end)}`;
        cursor = start + marker.length;
      }
    }
    setComposerValue(textarea, nextValue, cursor);
  }

  function insertTextAtCursor(text) {
    const textarea = requireComposer();
    if (!textarea) return false;
    const value = textarea.value;
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? start;
    const nextValue = `${value.slice(0, start)}${text}${value.slice(end)}`;
    setComposerValue(textarea, nextValue, start + text.length);
    return true;
  }

  // ---------- 메뉴 항목 정의 ----------
  const ITEMS = [
    { id: "quote", label: "대사 따옴표", glyph: "”", glyphClass: "qp-glyph--quote", run: () => insertMarker('"') },
    { id: "narration", label: "나레이션", svg: SVG_ASTERISK, iconClass: "qp-icon--star", run: () => insertMarker("*") },
    { id: "image", label: "이미지 추가", svg: SVG_IMAGE, run: openFilePicker },
    { id: "memo", label: "메모", svg: SVG_NOTE, run: openMemoModal },
    { id: "bookmark", label: "북마크", svg: SVG_BOOKMARK, run: openBookmarks },
  ];

  function itemIcon(item, className) {
    const base = className || "qp-icon";
    if (item.svg) return iconSpan(item.svg, `${base}${item.iconClass ? ` ${item.iconClass}` : ""}`);
    const span = el("span", `${base} qp-glyph${item.glyphClass ? ` ${item.glyphClass}` : ""}`);
    span.textContent = item.glyph;
    return span;
  }

  function openFilePicker() {
    const shell = activeShell();
    const fileInput = shell?.querySelector('input[type="file"]');
    const textarea = shell?.querySelector(COMPOSER_SELECTOR);
    if (!fileInput || (textarea && textarea.disabled)) {
      toast("채팅방을 먼저 열어주세요");
      return;
    }
    fileInput.click();
  }

  // 턴 북마크가 꺼져 있으면 메뉴와 탭에서 북마크 항목을 아예 숨긴다
  let bookmarkAvailable = false;

  function checkBookmarkAvailability() {
    const available = !!document.querySelector(TB_LAUNCHER_SELECTOR);
    if (available === bookmarkAvailable) return;
    bookmarkAvailable = available;
    renderChips();
    if (menuOpen) renderMenu();
  }

  function itemVisible(item) {
    return item.id !== "bookmark" || bookmarkAvailable;
  }

  function openBookmarks() {
    const launcher = document.querySelector(TB_LAUNCHER_SELECTOR);
    if (launcher) {
      launcher.click();
    } else {
      toast("턴 북마크 확장이 켜져 있지 않아요");
    }
  }

  // ---------- + 버튼 장착 ----------
  function ensureMounted() {
    for (const shell of document.querySelectorAll(SHELL_SELECTOR)) {
      if (shell.hasAttribute("data-qp-shell")) continue;
      const fileInput = shell.querySelector('input[type="file"]');
      const textarea = shell.querySelector(COMPOSER_SELECTOR);
      if (!fileInput || !textarea) continue;

      shell.setAttribute("data-qp-shell", "");
      const btn = el("button", "qp-plus-btn");
      btn.type = "button";
      btn.title = "퀵 팔레트";
      btn.setAttribute("aria-label", "퀵 팔레트 메뉴 열기");
      btn.innerHTML = SVG_PLUS;
      keepComposerFocus(btn);
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleMenu(btn);
      });
      shell.prepend(btn);

      if (typeof ResizeObserver === "function") {
        if (!shellResizeObserver) shellResizeObserver = new ResizeObserver(() => positionChips());
        shellResizeObserver.observe(shell);
      }
    }
  }

  // ---------- 팝업 메뉴 ----------
  function buildMenu() {
    if (menuEl) return menuEl;
    menuEl = el("div", "qp-menu");
    menuEl.setAttribute("data-chat-floating-panel", "");
    document.body.append(menuEl);
    return menuEl;
  }

  function onGlobalPointerDown(event) {
    if (!menuOpen) return;
    const target = event.target;
    if (menuEl?.contains(target)) return;
    if (target instanceof Element && target.closest(".qp-plus-btn")) return;
    closeMenu();
  }

  function onGlobalKeyDown(event) {
    if (event.key !== "Escape") return;
    if (menuOpen) { closeMenu(); return; }
    if (modalEl) closeMemoModal();
  }

  function renderMenu() {
    if (!menuEl) return;
    menuEl.replaceChildren();
    for (const item of ITEMS) {
      if (!itemVisible(item)) continue;
      const row = el("button", "qp-item");
      row.type = "button";
      keepComposerFocus(row);
      row.append(itemIcon(item, "qp-item-icon"), el("span", "qp-item-label", item.label));

      const check = el("span", "qp-checkbox");
      check.setAttribute("role", "checkbox");
      check.setAttribute("aria-checked", state.chips[item.id] ? "true" : "false");
      check.title = "입력창 위에 미니 버튼으로 표시";
      if (state.chips[item.id]) {
        check.classList.add("qp-checkbox--on");
        check.innerHTML = SVG_CHECK;
      }
      check.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const turnedOn = !state.chips[item.id];
        state.chips[item.id] = turnedOn;
        if (turnedOn) {
          if (!state.chipOrder.includes(item.id)) state.chipOrder.push(item.id);
        } else {
          state.chipOrder = state.chipOrder.filter((id) => id !== item.id);
        }
        persist();
        renderMenu();
        renderChips();
      });
      row.append(check);

      row.addEventListener("click", () => {
        closeMenu();
        item.run();
      });
      menuEl.append(row);
    }
  }

  function positionMenu() {
    if (!menuEl || !menuAnchor || !menuAnchor.isConnected) return closeMenu();
    const rect = menuAnchor.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return closeMenu();
    menuEl.style.left = `${Math.max(8, Math.round(rect.left))}px`;
    menuEl.style.bottom = `${Math.round(window.innerHeight - rect.top + 8)}px`;
  }

  function toggleMenu(anchorBtn) {
    if (menuOpen && menuAnchor === anchorBtn) return closeMenu();
    buildMenu();
    menuAnchor = anchorBtn;
    renderMenu();
    menuEl.classList.add("qp-menu--open");
    menuOpen = true;
    anchorBtn.classList.add("qp-plus-btn--open");
    positionMenu();
  }

  function closeMenu() {
    menuOpen = false;
    menuEl?.classList.remove("qp-menu--open");
    menuAnchor?.classList.remove("qp-plus-btn--open");
    menuAnchor = null;
  }

  // ---------- 미니 칩 바 ----------
  function buildChips() {
    if (chipsEl) return chipsEl;
    // 전체 폭 투명 독: 확장 서랍 자동 수집(14~170px 크기 조건)을 피한다
    chipsEl = el("div", "qp-chips-dock");
    chipsEl.setAttribute("data-chat-floating-panel", "");
    chipsRow = el("div", "qp-chips");
    chipsEl.append(chipsRow);
    document.body.append(chipsEl);
    return chipsEl;
  }

  function renderChips() {
    buildChips();
    chipsRow.replaceChildren();
    for (const id of state.chipOrder) {
      const item = ITEMS.find((entry) => entry.id === id);
      if (!item || !state.chips[id] || !itemVisible(item)) continue;
      const chip = el("button", "qp-chip");
      chip.type = "button";
      chip.title = item.label;
      chip.setAttribute("aria-label", item.label);
      keepComposerFocus(chip);
      chip.append(itemIcon(item, "qp-chip-icon"));
      chip.addEventListener("click", (event) => {
        event.preventDefault();
        item.run();
      });
      chipsRow.append(chip);
    }
    updateChipContrast();
    positionChips();
  }

  // ---------- 탭 아이콘 색 자동 대비 ----------
  // 탭 배경(입력창 외곽선 색)이 어두우면 크림색, 옅으면 잉크색 아이콘을 쓴다.
  // 실제 탭이 아니라 숨은 프로브에서 색을 재야 호버 중 배경 변화에 안 흔들린다.
  let probeEl = null;
  let chipProbeEl = null;

  function parseColor(str) {
    const s = String(str || "").trim();
    let m = /rgba?\(([^)]+)\)/.exec(s);
    if (m) {
      const parts = m[1].split(/[\s,/]+/).filter(Boolean);
      if (parts.length < 3) return null;
      const nums = parts.map((p) => (p.endsWith("%") ? parseFloat(p) * 2.55 : parseFloat(p)));
      if (nums.slice(0, 3).some((v) => Number.isNaN(v))) return null;
      let alpha = 1;
      if (parts.length > 3) {
        alpha = parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
        if (Number.isNaN(alpha)) alpha = 1;
      }
      return [nums[0], nums[1], nums[2], alpha];
    }
    m = /color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\)/.exec(s);
    if (m) {
      const alpha = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
      return [parseFloat(m[1]) * 255, parseFloat(m[2]) * 255, parseFloat(m[3]) * 255, alpha];
    }
    return null;
  }

  function themeBackgroundColor() {
    if (!probeEl || !probeEl.isConnected) {
      probeEl = el("div");
      probeEl.setAttribute("aria-hidden", "true");
      probeEl.style.cssText =
        "position:fixed;left:-9999px;bottom:0;width:2px;height:2px;pointer-events:none;background:var(--background,#fff);";
      document.body.append(probeEl);
    }
    return parseColor(getComputedStyle(probeEl).backgroundColor) || [255, 255, 255, 1];
  }

  function chipBackgroundColor() {
    if (!chipProbeEl || !chipProbeEl.isConnected) {
      chipProbeEl = el("div");
      chipProbeEl.setAttribute("aria-hidden", "true");
      chipProbeEl.style.cssText =
        "position:fixed;left:-9999px;bottom:0;width:2px;height:2px;pointer-events:none;" +
        "background:var(--marinara-chat-chrome-input-border, rgba(120,120,120,0.18));";
      document.body.append(chipProbeEl);
    }
    return parseColor(getComputedStyle(chipProbeEl).backgroundColor);
  }

  function updateChipContrast() {
    if (!chipsRow || chipsRow.childElementCount === 0) return;
    const chipBg = chipBackgroundColor();
    const base = themeBackgroundColor();
    let blended = base.slice(0, 3);
    if (chipBg) {
      const alpha = Math.min(1, Math.max(0, chipBg[3]));
      blended = [
        chipBg[0] * alpha + base[0] * (1 - alpha),
        chipBg[1] * alpha + base[1] * (1 - alpha),
        chipBg[2] * alpha + base[2] * (1 - alpha),
      ];
    }
    const [lr, lg, lb] = blended.map((v) => {
      const c = Math.min(255, Math.max(0, v)) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    const luminance = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
    chipsRow.style.setProperty("--qp-chip-ink", luminance < 0.45 ? "#faf6ee" : "#4a4f53");
  }

  // 채팅방을 나가면 앱이 채팅 화면을 목록 화면 "뒤에" 살려두는 경우가 있다.
  // 그때 입력창은 DOM 상 보이는 상태라 기하 검사를 전부 통과하므로,
  // 입력창 중앙 지점의 최상위 요소를 조회해 다른 화면에 덮였는지 직접 확인한다.
  function shellCovered(shell, rect) {
    const x = Math.min(window.innerWidth - 1, Math.max(1, rect.left + rect.width / 2));
    const y = Math.min(window.innerHeight - 1, Math.max(1, rect.top + rect.height / 2));
    const top = document.elementFromPoint(x, y);
    if (!top) return true;
    return !shell.contains(top);
  }

  function positionChips() {
    if (!chipsEl || !chipsRow) return;
    const hasChips = chipsRow.childElementCount > 0;
    const shell = activeShell();
    if (!hasChips || !shell || !transcriptVisible()) {
      chipsEl.classList.remove("qp-chips-dock--show");
      return;
    }
    const rect = shell.getBoundingClientRect();
    if (shellCovered(shell, rect)) {
      chipsEl.classList.remove("qp-chips-dock--show");
      return;
    }
    chipsRow.style.marginLeft = `${Math.round(rect.left + 12)}px`;
    chipsEl.style.bottom = `${Math.round(window.innerHeight - rect.top)}px`;
    chipsEl.classList.add("qp-chips-dock--show");
  }

  // ---------- 메모 모달 ----------
  function openMemoModal() {
    if (modalEl) return;
    modal.editor = null;
    modal.search = "";
    modal.searchOpen = false;
    modal.confirmDelete = null;
    modal.expanded.clear();

    modalEl = el("div", "qp-overlay");
    modalEl.setAttribute("data-chat-floating-panel", "");
    modalEl.addEventListener("pointerdown", (event) => {
      if (event.target === modalEl) closeMemoModal();
    });
    document.body.append(modalEl);
    renderMemoModal();
  }

  function closeMemoModal() {
    modalEl?.remove();
    modalEl = null;
  }

  function memoById(id) {
    return state.memos.find((m) => m.id === id) || null;
  }

  function filteredMemos() {
    const query = modal.search.trim().toLowerCase();
    if (!query) return [...state.memos];
    return state.memos.filter(
      (m) => m.title.toLowerCase().includes(query) || m.content.toLowerCase().includes(query),
    );
  }

  function moveMemo(memo, delta) {
    const index = state.memos.indexOf(memo);
    const target = index + delta;
    if (index === -1 || target < 0 || target >= state.memos.length) return;
    if (state.memos[target].pinned !== memo.pinned) return; // 고정 그룹 경계는 넘지 않는다
    [state.memos[index], state.memos[target]] = [state.memos[target], state.memos[index]];
    persist();
    renderMemoModal();
  }

  function renderMemoModal() {
    if (!modalEl) return;
    // 다시 그려도 목록 스크롤 위치가 유지되게 한다
    const prevScroll = modalEl.querySelector(".qp-memo-list")?.scrollTop ?? 0;
    modalEl.replaceChildren();
    const card = el("div", "qp-modal");

    // 헤더
    const head = el("div", "qp-modal-head");
    const titleWrap = el("div", "qp-modal-title-wrap");
    titleWrap.append(el("div", "qp-modal-title", "메모"));
    const headActions = el("div", "qp-modal-head-actions");
    const searchBtn = el("button", "qp-icon-btn");
    searchBtn.type = "button";
    searchBtn.title = "검색";
    searchBtn.innerHTML = SVG_SEARCH;
    if (modal.searchOpen) searchBtn.classList.add("qp-icon-btn--active");
    searchBtn.addEventListener("click", () => {
      modal.searchOpen = !modal.searchOpen;
      if (!modal.searchOpen) modal.search = "";
      renderMemoModal();
    });
    const closeBtn = el("button", "qp-icon-btn");
    closeBtn.type = "button";
    closeBtn.title = "닫기";
    closeBtn.innerHTML = SVG_X;
    closeBtn.addEventListener("click", closeMemoModal);
    headActions.append(searchBtn, closeBtn);
    head.append(titleWrap, headActions);
    card.append(head);

    // 검색 줄
    if (modal.searchOpen) {
      const searchRow = el("div", "qp-search-row");
      const searchInput = document.createElement("input");
      searchInput.type = "search";
      searchInput.className = "qp-input";
      searchInput.placeholder = "제목이나 내용으로 검색";
      searchInput.autocomplete = "off";
      searchInput.value = modal.search;
      searchInput.addEventListener("input", () => {
        modal.search = searchInput.value;
        renderMemoList(listBox);
      });
      searchRow.append(searchInput);
      card.append(searchRow);
      setTimeout(() => searchInput.focus(), 0);
    }

    // 새 메모 추가
    const addBtn = el("button", "qp-add-btn");
    addBtn.type = "button";
    addBtn.innerHTML = `${SVG_PLUS}<span>새 메모 추가</span>`;
    addBtn.addEventListener("click", () => {
      modal.editor = { id: null, title: "", content: "" };
      renderMemoModal();
    });
    card.append(addBtn);

    // 편집기 (새 메모 / 수정)
    if (modal.editor) card.append(buildEditor());

    // 목록
    const listBox = el("div", "qp-memo-list");
    renderMemoList(listBox);
    card.append(listBox);

    modalEl.append(card);
    listBox.scrollTop = prevScroll;
  }

  function buildEditor() {
    const editor = el("div", "qp-editor");
    // 제목은 한 줄짜리 textarea 로 만든다: input 과 달리 모바일 자동완성
    // (비번/카드/주소) 바의 대상이 아니어서 키보드 위 흰색 바가 뜨지 않는다.
    const titleInput = document.createElement("textarea");
    titleInput.className = "qp-input qp-editor-title";
    titleInput.rows = 1;
    titleInput.placeholder = "제목";
    titleInput.maxLength = 200;
    titleInput.autocomplete = "off";
    titleInput.value = modal.editor.title;
    titleInput.addEventListener("input", () => {
      const clean = titleInput.value.replace(/\n/g, "");
      if (clean !== titleInput.value) titleInput.value = clean;
      modal.editor.title = clean;
    });
    titleInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        contentInput.focus();
      }
    });

    const contentInput = document.createElement("textarea");
    contentInput.className = "qp-input qp-editor-textarea";
    contentInput.placeholder = "내용";
    contentInput.autocomplete = "off";
    contentInput.value = modal.editor.content;
    contentInput.addEventListener("input", () => { modal.editor.content = contentInput.value; });

    const btnRow = el("div", "qp-editor-actions");
    const cancelBtn = el("button", "qp-btn", "취소");
    cancelBtn.type = "button";
    cancelBtn.addEventListener("click", () => {
      modal.editor = null;
      renderMemoModal();
    });
    const saveBtn = el("button", "qp-btn qp-btn--primary", "저장");
    saveBtn.type = "button";
    saveBtn.addEventListener("click", () => {
      const title = modal.editor.title.trim();
      const content = modal.editor.content;
      if (!title && !content.trim()) {
        toast("제목이나 내용을 입력해주세요");
        return;
      }
      const now = new Date().toISOString();
      if (modal.editor.id) {
        const memo = memoById(modal.editor.id);
        if (memo) {
          memo.title = title || "제목 없음";
          memo.content = content;
          memo.updatedAt = now;
        }
      } else {
        const memo = normalizeMemo({ title: title || "제목 없음", content, createdAt: now, updatedAt: now });
        const firstUnpinned = state.memos.findIndex((m) => !m.pinned);
        if (firstUnpinned === -1) state.memos.push(memo);
        else state.memos.splice(firstUnpinned, 0, memo);
      }
      persist();
      modal.editor = null;
      renderMemoModal();
      toast("메모를 저장했어요");
    });
    btnRow.append(cancelBtn, saveBtn);

    editor.append(titleInput, contentInput, btnRow);
    setTimeout(() => titleInput.focus(), 0);
    return editor;
  }

  function renderMemoList(listBox) {
    listBox.replaceChildren();
    const memos = filteredMemos();
    if (memos.length === 0) {
      const empty = el("div", "qp-empty",
        state.memos.length === 0 ? "아직 메모가 없어요. 새 메모를 추가해보세요!" : "검색 결과가 없어요.");
      listBox.append(empty);
      return;
    }
    for (const memo of memos) listBox.append(buildMemoCard(memo));
  }

  function buildMemoCard(memo) {
    const expanded = modal.expanded.has(memo.id);
    const card = el("div", "qp-memo-card");
    if (expanded) card.classList.add("qp-memo-card--open");

    // 카드 헤더 (클릭 → 내용 펼치기)
    const head = el("div", "qp-memo-head");
    const info = el("div", "qp-memo-info");
    info.append(el("div", "qp-memo-title", memo.title || "제목 없음"), el("div", "qp-memo-date", formatDate(memo.updatedAt)));
    const headBtns = el("div", "qp-memo-head-actions");

    const pinBtn = el("button", "qp-icon-btn qp-icon-btn--sm");
    pinBtn.type = "button";
    pinBtn.title = memo.pinned ? "고정 해제" : "위에 고정";
    pinBtn.innerHTML = SVG_STAR;
    if (memo.pinned) pinBtn.classList.add("qp-icon-btn--pinned");
    pinBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      memo.pinned = !memo.pinned;
      partitionMemos();
      persist();
      renderMemoModal();
    });

    const editBtn = el("button", "qp-icon-btn qp-icon-btn--sm");
    editBtn.type = "button";
    editBtn.title = "수정";
    editBtn.innerHTML = SVG_PEN;
    editBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      modal.editor = { id: memo.id, title: memo.title, content: memo.content };
      renderMemoModal();
    });

    const deleteBtn = el("button", "qp-icon-btn qp-icon-btn--sm qp-icon-btn--danger");
    deleteBtn.type = "button";
    if (modal.confirmDelete === memo.id) {
      deleteBtn.classList.add("qp-icon-btn--confirm");
      deleteBtn.textContent = "삭제 확인";
      deleteBtn.title = "한 번 더 누르면 삭제됩니다";
    } else {
      deleteBtn.title = "삭제";
      deleteBtn.innerHTML = SVG_TRASH;
    }
    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      if (modal.confirmDelete === memo.id) {
        state.memos = state.memos.filter((m) => m.id !== memo.id);
        modal.confirmDelete = null;
        persist();
        renderMemoModal();
        toast("메모를 삭제했어요");
      } else {
        modal.confirmDelete = memo.id;
        renderMemoModal();
      }
    });

    const chevron = el("span", "qp-memo-chevron");
    chevron.innerHTML = SVG_CHEVRON;

    headBtns.append(pinBtn, editBtn, deleteBtn, chevron);
    head.append(info, headBtns);
    head.addEventListener("click", () => {
      if (modal.expanded.has(memo.id)) modal.expanded.delete(memo.id);
      else modal.expanded.add(memo.id);
      modal.confirmDelete = null;
      renderMemoModal();
    });
    card.append(head);

    // 펼친 내용
    if (expanded) {
      const body = el("div", "qp-memo-body");
      body.textContent = memo.content;
      card.append(body);
    }

    // 액션 버튼 줄
    const actions = el("div", "qp-memo-actions");
    const insertBtn = el("button", "qp-btn qp-btn--ghost");
    insertBtn.type = "button";
    insertBtn.innerHTML = `${SVG_INSERT}<span>입력창</span>`;
    insertBtn.addEventListener("click", () => {
      closeMemoModal();
      if (insertTextAtCursor(memo.content)) toast("입력창에 넣었어요");
    });
    const copyBtn = el("button", "qp-btn qp-btn--ghost");
    copyBtn.type = "button";
    copyBtn.innerHTML = `${SVG_COPY}<span>복사</span>`;
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(memo.content);
        toast("클립보드에 복사했어요");
      } catch {
        const helper = document.createElement("textarea");
        helper.value = memo.content;
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.append(helper);
        helper.select();
        try {
          document.execCommand("copy");
          toast("클립보드에 복사했어요");
        } catch {
          toast("복사에 실패했어요");
        }
        helper.remove();
      }
    });
    actions.append(insertBtn, copyBtn);

    // 순서 변경 (검색 중에는 순서가 왜곡돼 보이므로 숨긴다)
    if (!modal.search.trim()) {
      const upBtn = el("button", "qp-icon-btn qp-icon-btn--sm");
      upBtn.type = "button";
      upBtn.title = "위로";
      upBtn.innerHTML = SVG_UP;
      upBtn.addEventListener("click", () => moveMemo(memo, -1));
      const downBtn = el("button", "qp-icon-btn qp-icon-btn--sm");
      downBtn.type = "button";
      downBtn.title = "아래로";
      downBtn.innerHTML = SVG_DOWN;
      downBtn.addEventListener("click", () => moveMemo(memo, 1));
      actions.append(upBtn, downBtn);
    }
    card.append(actions);

    return card;
  }

  // ---------- 주기 스캔 ----------
  function tick() {
    ensureMounted();
    checkBookmarkAvailability();
    positionChips();
    updateChipContrast();
    if (menuOpen) positionMenu();
  }

  // 입력·클릭·화면 크기 변화 직후 0.6초 동안만 매 프레임 위치를 갱신하는 버스트.
  // 입력창 이동 애니메이션을 부드럽게 따라가되, 평소에는 돌지 않아 부하가 없다.
  let followUntil = 0;
  let followFrame = 0;

  function followLoop() {
    followFrame = requestAnimationFrame(() => {
      positionChips();
      if (menuOpen) positionMenu();
      if (performance.now() < followUntil) followLoop();
      else followFrame = 0;
    });
  }

  function kickFollow() {
    followUntil = performance.now() + 600;
    if (!followFrame) followLoop();
  }

  function onWindowResize() {
    positionChips();
    if (menuOpen) positionMenu();
    kickFollow();
  }

  // ---------- 시작/정리 ----------
  let stopped = false;

  async function start() {
    await loadState();
    // 불러오는 사이 꺼졌으면(켜고 바로 끄기, 재승인) 여기서 멈춘다. 전에는 stop()이 먼저 지나간 뒤
    // 아래가 이어져 0.7초마다 + 버튼을 다시 꽂는 타이머가 살아 있었다.
    if (stopped) return;
    ensureMounted();
    bookmarkAvailable = !!document.querySelector(TB_LAUNCHER_SELECTOR);
    renderChips();
    scanTimer = setInterval(tick, SCAN_MS);
    window.addEventListener("resize", onWindowResize);
    window.visualViewport?.addEventListener("resize", onWindowResize);
    // 메뉴 바깥 클릭 닫기 + Esc(메뉴/메모 모달 닫기)는 처음부터 등록해 둔다
    // (메뉴를 연 적 없이 탭으로 메모를 바로 열어도 Esc가 동작해야 하므로)
    document.addEventListener("pointerdown", onGlobalPointerDown, true);
    document.addEventListener("keydown", onGlobalKeyDown, true);
    // 타이핑(입력창 높이 변화)과 클릭(화면 전환) 직후에는 즉시 + 부드럽게 따라붙는다
    document.addEventListener("input", kickFollow, { capture: true, passive: true });
    document.addEventListener("pointerup", kickFollow, { capture: true, passive: true });
    cleanupFns.push(() => {
      window.removeEventListener("resize", onWindowResize);
      window.visualViewport?.removeEventListener("resize", onWindowResize);
      document.removeEventListener("pointerdown", onGlobalPointerDown, true);
      document.removeEventListener("keydown", onGlobalKeyDown, true);
      document.removeEventListener("input", kickFollow, true);
      document.removeEventListener("pointerup", kickFollow, true);
      if (followFrame) cancelAnimationFrame(followFrame);
      followFrame = 0;
    });
  }

  function stop() {
    stopped = true;
    clearInterval(scanTimer);
    shellResizeObserver?.disconnect();
    for (const fn of cleanupFns.splice(0)) {
      try { fn(); } catch {}
    }
    menuEl?.remove();
    chipsEl?.remove();
    modalEl?.remove();
    toastEl?.remove();
    probeEl?.remove();
    chipProbeEl?.remove();
    menuEl = chipsEl = chipsRow = modalEl = toastEl = probeEl = chipProbeEl = null;
    for (const shell of document.querySelectorAll("[data-qp-shell]")) {
      shell.removeAttribute("data-qp-shell");
      shell.querySelector(".qp-plus-btn")?.remove();
    }
  }

  try {
    if (typeof marinara !== "undefined" && typeof marinara?.onCleanup === "function") {
      marinara.onCleanup(stop);
    }
  } catch {}

  void start();
})();
