/**
 * Main Application Controller
 * Coordinates Tab switching, Internationalization (i18n), Board UI,
 * Technique Visualizer, and Theory Explorer.
 */

import { BoardUI } from './ui/boardUI.js';
import { VisualizerUI } from './ui/visualizerUI.js';
import { TheoryUI } from './ui/theoryUI.js';
import {
  generatePuzzle,
  generateDailyPuzzle,
  getDailySchedule,
  getTodayDateString,
  daysBetweenDates
} from './engine/generator.js';
import { TRANSLATIONS, localizeStep } from './i18n/translations.js';

const STORAGE_KEY = 'changoku_state_v1';
const DAILY_PROGRESS_KEY = 'changoku_daily_progress_v1';
const DAILY_STATS_KEY = 'changoku_daily_stats_v1';

class App {
  constructor() {
    this.savedState = this.loadSavedAppState();
    this.dailyStats = this.loadDailyStats();
    this.currentDifficulty = (this.savedState && this.savedState.difficulty) || 'medium';
    this.theme = (this.savedState && this.savedState.theme) || 'light';
    this.isDaily = Boolean(this.savedState && this.savedState.isDaily);
    this.dailyDate = (this.savedState && this.savedState.dailyDate) || getTodayDateString();
    this.elapsedSeconds = (this.savedState && this.savedState.elapsedSeconds) || 0;
    this.hintsUsed = (this.savedState && this.savedState.hintsUsed) || 0;
    this.isCompleted = Boolean(this.savedState && this.savedState.isCompleted);

    // Priority: URL ?lang= > saved user preference > build-time default > 'es'
    const buildLang = typeof window !== 'undefined' && window.DEFAULT_LANG;
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    this.lang = urlLang || (this.savedState && this.savedState.lang) || buildLang || 'es';

    this.initTabs();
    this.initPlayBoard();
    this.initTechniqueVisualizer();
    this.initTheorySection();
    this.initLanguageSwitcher();
    this.initThemeSwitcher();
    this.initTimer();
    this.applyTheme(this.theme, false);
    this.applyLanguage(this.lang);
  }

  loadSavedAppState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  loadDailyProgress(dateStr) {
    try {
      const raw = window.localStorage.getItem(DAILY_PROGRESS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.dailyDate === dateStr ? parsed : null;
    } catch {
      return null;
    }
  }

  loadDailyStats() {
    try {
      const raw = window.localStorage.getItem(DAILY_STATS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return {
        currentStreak: (parsed && parsed.currentStreak) || 0,
        bestStreak: (parsed && parsed.bestStreak) || 0,
        streakJokers: (parsed && typeof parsed.streakJokers === 'number') ? parsed.streakJokers : 0,
        lastCompletedDate: (parsed && parsed.lastCompletedDate) || null,
        completedDates: (parsed && parsed.completedDates) || {}
      };
    } catch {
      return { currentStreak: 0, bestStreak: 0, streakJokers: 0, lastCompletedDate: null, completedDates: {} };
    }
  }

  syncDailyStreakStatus(todayStr = getTodayDateString()) {
    const lastDate = this.dailyStats.lastCompletedDate;
    if (!lastDate || this.dailyStats.currentStreak === 0) return;

    // Allow finishing yesterday's in-progress board right after midnight without expiring streak yet
    const referenceDate =
      this.isDaily && !this.isCompleted && daysBetweenDates(this.dailyDate, todayStr) === 1
        ? this.dailyDate
        : todayStr;

    const missedDays = daysBetweenDates(lastDate, referenceDate) - 1;
    if (missedDays > (this.dailyStats.streakJokers || 0)) {
      this.dailyStats.currentStreak = 0;
      this.saveDailyStats();
    }
  }

  saveDailyStats() {
    try {
      window.localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(this.dailyStats));
    } catch {
      // Ignore storage errors
    }
  }

  recordDailyCompletion(dateStr) {
    const todayStr = getTodayDateString();
    let jokersUsedNow = 0;

    if (!this.dailyStats.completedDates[dateStr]) {
      const lastDate = this.dailyStats.lastCompletedDate;
      const diffDays = lastDate ? daysBetweenDates(lastDate, dateStr) : Infinity;

      if (diffDays === 1) {
        this.dailyStats.currentStreak += 1;
      } else if (diffDays > 1 && diffDays - 1 <= (this.dailyStats.streakJokers || 0)) {
        // Missed (diffDays - 1) days, covered by earned Streak Jokers!
        jokersUsedNow = diffDays - 1;
        this.dailyStats.streakJokers -= jokersUsedNow;
        this.dailyStats.currentStreak += 1;
      } else if (diffDays !== 0) {
        this.dailyStats.currentStreak = 1;
      }

      // Earn +1 Streak Joker every 7 streak days, up to a max of 5
      if (this.dailyStats.currentStreak > 0 && this.dailyStats.currentStreak % 7 === 0) {
        this.dailyStats.streakJokers = Math.min(5, (this.dailyStats.streakJokers || 0) + 1);
      }

      if (!lastDate || daysBetweenDates(lastDate, dateStr) >= 0) {
        this.dailyStats.lastCompletedDate = dateStr;
      }

      // If this completed board was from an earlier day (e.g. Saturday finished on Monday)
      // and intermediate days (e.g. Sunday) were skipped beyond available Jokers, clear the streak
      const missedAfterCompletion = daysBetweenDates(this.dailyStats.lastCompletedDate, todayStr) - 1;
      if (missedAfterCompletion > (this.dailyStats.streakJokers || 0)) {
        this.dailyStats.currentStreak = 0;
      }

      if (this.dailyStats.currentStreak > this.dailyStats.bestStreak) {
        this.dailyStats.bestStreak = this.dailyStats.currentStreak;
      }
    }

    this.dailyStats.completedDates[dateStr] = {
      elapsedSeconds: this.elapsedSeconds,
      hintsUsed: this.hintsUsed,
      difficulty: this.currentDifficulty,
      jokersUsed: jokersUsedNow
    };
    this.saveDailyStats();
    return { jokersUsedNow, remainingJokers: this.dailyStats.streakJokers || 0 };
  }

  formatTime(sec = this.elapsedSeconds) {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  }

  initTimer() {
    this.timerInterval = setInterval(() => {
      const playPane = document.getElementById('tab-play');
      if (playPane && playPane.classList.contains('active') && !this.isCompleted) {
        this.elapsedSeconds += 1;
        this.updateBoardStatsText();
        if (this.elapsedSeconds % 5 === 0) {
          this.saveAppState();
        }
      }
    }, 1000);
  }

  updateBoardStatsText(statsOverride = null) {
    if (!this.boardUI) return;
    const stats = statsOverride || this.boardUI.getStats();
    const statsEl = document.getElementById('board-stats');
    if (statsEl) {
      statsEl.textContent = this.t().statsFormat(stats.filled, stats.conflicts, this.formatTime());
    }
  }

  saveAppState() {
    try {
      if (!this.boardUI) return;
      const boardState = this.boardUI.serializeState();
      const payload = {
        ...boardState,
        difficulty: this.currentDifficulty,
        lang: this.lang,
        theme: this.theme,
        isDaily: this.isDaily,
        dailyDate: this.dailyDate,
        elapsedSeconds: this.elapsedSeconds,
        hintsUsed: this.hintsUsed,
        isCompleted: this.isCompleted
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      if (this.isDaily) {
        window.localStorage.setItem(DAILY_PROGRESS_KEY, JSON.stringify(payload));
      }
    } catch {
      // Ignore storage quota or private mode errors
    }
  }

  t() {
    return TRANSLATIONS[this.lang] || TRANSLATIONS.es;
  }

  showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  initLanguageSwitcher() {
    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        const nextLang = this.lang === 'es' ? 'en' : 'es';
        this.applyLanguage(nextLang);
        this.saveAppState();
      });
    }
  }

  initThemeSwitcher() {
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(nextTheme, true);
        this.saveAppState();
      });
    }
  }

  applyTheme(theme, showFeedback = false) {
    this.theme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = this.theme;
    this.updateThemeButtonText();
    if (showFeedback) {
      const tr = this.t();
      this.showToast(this.theme === 'light' ? tr.toastThemeLight : tr.toastThemeDark);
    }
  }

  updateThemeButtonText() {
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      const tr = this.t();
      themeBtn.textContent = this.theme === 'light' ? tr.btnThemeDark : tr.btnThemeLight;
    }
  }

  updateKeypadProgress(digitCounts) {
    if (!Array.isArray(digitCounts)) return;
    document.querySelectorAll('.keypad-btn[data-num]').forEach(btn => {
      const d = parseInt(btn.dataset.num, 10);
      const count = digitCounts[d] || 0;
      const remaining = Math.max(0, 9 - count);
      const isCompleted = count >= 9;

      btn.classList.toggle('completed', isCompleted);
      btn.innerHTML = `<span class="keypad-digit">${d}</span><span class="keypad-rem">${isCompleted ? '✓' : remaining}</span>`;
    });
  }

  applyLanguage(lang) {
    this.lang = TRANSLATIONS[lang] ? lang : 'es';
    const tr = this.t();
    document.documentElement.lang = this.lang;

    // Header & Language button
    const brandTitle = document.getElementById('brand-title');
    if (brandTitle) {
      brandTitle.innerHTML = `${tr.appTitle} <span>${tr.appSubtitle}</span>`;
    }
    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.textContent = this.lang === 'es' ? '🇨🇱 ES' : '🇬🇧 EN';
      langBtn.title = tr.langLabel;
    }
    this.updateThemeButtonText();

    // Tabs
    const tabPlayBtn = document.querySelector('.tab-btn[data-tab="tab-play"]');
    if (tabPlayBtn) tabPlayBtn.innerHTML = `<span>🎮</span> ${tr.tabPlay}`;
    const tabVisBtn = document.querySelector('.tab-btn[data-tab="tab-visualizer"]');
    if (tabVisBtn) tabVisBtn.innerHTML = `<span>🔍</span> ${tr.tabVisualizer}`;
    const tabTheoryBtn = document.querySelector('.tab-btn[data-tab="tab-theory"]');
    if (tabTheoryBtn) tabTheoryBtn.innerHTML = `<span>📐</span> ${tr.tabTheory}`;

    // Play Board Action Buttons
    const setBtnText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    setBtnText('btn-erase', tr.btnErase);
    setBtnText('btn-note-mode', tr.btnNotes);
    setBtnText('btn-auto-cand', tr.btnAutoCand);
    setBtnText('btn-hint', tr.btnHint);
    setBtnText('btn-check-errors', tr.btnCheckErrors);
    setBtnText('btn-undo', tr.btnUndo);
    setBtnText('btn-redo', tr.btnRedo);
    setBtnText('btn-solve', tr.btnSolve);

    // Generator Card
    setBtnText('generator-card-title', tr.generatorTitle);
    const diffMap = {
      easy: tr.diffEasy,
      medium: tr.diffMedium,
      hard: tr.diffHard,
      expert: tr.diffExpert
    };
    document.querySelectorAll('.diff-btn').forEach(btn => {
      const d = btn.dataset.diff;
      if (diffMap[d]) btn.textContent = diffMap[d];
    });
    setBtnText('btn-new-game', tr.btnNewGame);
    setBtnText('btn-custom-board', tr.btnImport);
    setBtnText('btn-export-board', tr.btnExport);

    // Status & Hints
    setBtnText('status-card-title', tr.statusTitle);
    this.updateBoardStatsText();
    this.updateDailyChallengeUI();
    const hintBanner = document.getElementById('hint-banner');
    if (hintBanner && !this.lastHintStep) {
      hintBanner.innerHTML = tr.defaultHintBanner;
    } else if (hintBanner && this.lastHintStep) {
      const loc = localizeStep(this.lastHintStep, this.lang);
      hintBanner.innerHTML = `<strong>${loc.name}:</strong> ${loc.description}`;
    }

    // Controls Guide
    setBtnText('controls-card-title', tr.controlsTitle);
    const controlsList = document.getElementById('controls-guide-list');
    if (controlsList) {
      controlsList.innerHTML = tr.controlsList.map(item => `<li>${item}</li>`).join('');
    }

    // Export Modal
    setBtnText('modal-title-text', tr.modalTitle);
    setBtnText('modal-initial-label', tr.modalInitialLabel);
    setBtnText('modal-current-label', tr.modalCurrentLabel);
    setBtnText('modal-diag-label', tr.modalDiagLabel);
    setBtnText('copy-initial-btn', tr.btnCopy);
    setBtnText('copy-current-btn', tr.btnCopy);

    // Visualizer Sidebar & Labels
    setBtnText('vis-group-basic', tr.visGroupBasic);
    setBtnText('vis-group-intersections', tr.visGroupIntersections);
    setBtnText('vis-group-subsets', tr.visGroupSubsets);
    setBtnText('vis-group-fish', tr.visGroupFish);
    setBtnText('vis-group-wings', tr.visGroupWings);
    setBtnText('legend-base', tr.legendBase);
    setBtnText('legend-pivot', tr.legendPivot);
    setBtnText('legend-wing', tr.legendWing);
    setBtnText('legend-target', tr.legendTarget);
    setBtnText('legend-elim', tr.legendElim);
    setBtnText('label-core-rule', tr.labelCoreRule);
    setBtnText('label-deduction-step', tr.labelDeductionStep);
    setBtnText('tech-reset-btn', tr.btnResetScenario);
    setBtnText('tech-transfer-btn', tr.btnTransferPlay);

    // Update technique buttons in sidebar
    document.querySelectorAll('.tech-list-btn').forEach(btn => {
      const techId = btn.dataset.techId;
      const techTrans = tr.techniques && tr.techniques[techId];
      if (techTrans) {
        const shortName = techTrans.sidebarName || techTrans.name.split(' (')[0];
        btn.innerHTML = `${shortName} <span class="tech-badge">${techTrans.difficulty}</span>`;
      }
    });

    if (this.visualizerUI) {
      this.visualizerUI.setLanguage(this.lang);
    }

    if (this.theoryUI) {
      this.theoryUI.setLanguage(this.lang);
    }
  }

  updateDailyChallengeUI() {
    const tr = this.t();
    const todayStr = getTodayDateString();
    this.syncDailyStreakStatus(todayStr);
    const sched = getDailySchedule(todayStr);
    const dayShort = (tr.dayNamesShort && tr.dayNamesShort[sched.dayOfWeek]) || '';
    const diffMap = {
      easy: tr.diffEasy,
      medium: tr.diffMedium,
      hard: tr.diffHard,
      expert: tr.diffExpert
    };
    const diffLabel = diffMap[sched.targetDifficulty] || sched.targetDifficulty;

    const titleEl = document.getElementById('daily-title-text');
    if (titleEl) titleEl.textContent = tr.dailyTitle;

    const dayBadge = document.getElementById('daily-day-badge');
    if (dayBadge) dayBadge.textContent = `${dayShort} • ${diffLabel}`;

    const streakBadge = document.getElementById('daily-streak-badge');
    if (streakBadge) streakBadge.textContent = tr.streakFormat(this.dailyStats.currentStreak);

    const dailyBtn = document.getElementById('btn-daily-challenge');
    const todayCompleted = Boolean(this.dailyStats.completedDates[todayStr]);
    if (dailyBtn) {
      if (todayCompleted) {
        dailyBtn.textContent = tr.btnCompletedDaily;
        dailyBtn.classList.add('completed');
      } else if (this.isDaily && this.dailyDate === todayStr) {
        dailyBtn.textContent = tr.btnPlayingDaily;
        dailyBtn.classList.remove('completed');
      } else {
        dailyBtn.textContent = tr.btnPlayDaily;
        dailyBtn.classList.remove('completed');
      }
    }

    const shareBtn = document.getElementById('btn-share-result');
    if (shareBtn) {
      shareBtn.textContent = tr.btnShareResult;
      shareBtn.style.display = (this.isCompleted || todayCompleted) ? 'inline-flex' : 'none';
    }
  }

  getShareSummaryText() {
    const tr = this.t();
    const dateStr = this.isDaily ? this.dailyDate : getTodayDateString();
    const sched = getDailySchedule(dateStr);
    const dayName = (tr.dayNamesFull && tr.dayNamesFull[sched.dayOfWeek]) || '';
    const diffMap = {
      easy: tr.diffEasy,
      medium: tr.diffMedium,
      hard: tr.diffHard,
      expert: tr.diffExpert
    };
    const diffLabel = diffMap[this.currentDifficulty] || this.currentDifficulty;

    return tr.shareTextFormat({
      isDaily: this.isDaily,
      dateStr,
      dayName,
      diffLabel,
      timeStr: this.formatTime(this.elapsedSeconds),
      hintsUsed: this.hintsUsed,
      streak: this.dailyStats.currentStreak
    });
  }

  initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');
      });
    });
  }

  switchTab(tabId) {
    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (btn) btn.click();
  }

  initPlayBoard() {
    const boardEl = document.getElementById('play-board');
    const hintBanner = document.getElementById('hint-banner');
    const statsEl = document.getElementById('board-stats');
    const noteBtn = document.getElementById('btn-note-mode');

    this.boardUI = new BoardUI(boardEl, {
      onStateChange: (stats) => {
        const tr = this.t();
        this.updateBoardStatsText(stats);
        if (stats.digitCounts) {
          this.updateKeypadProgress(stats.digitCounts);
        }
        if (stats.completed && !this.isCompleted) {
          this.isCompleted = true;
          let jokerInfo = null;
          if (this.isDaily) {
            jokerInfo = this.recordDailyCompletion(this.dailyDate);
          }
          this.updateDailyChallengeUI();
          if (jokerInfo && jokerInfo.jokersUsedNow > 0 && tr.toastJokerUsed) {
            const jokerMsg = tr.toastJokerUsed(
              jokerInfo.jokersUsedNow,
              this.dailyStats.currentStreak,
              jokerInfo.remainingJokers
            );
            if (hintBanner) hintBanner.textContent = jokerMsg;
            this.showToast(jokerMsg);
          } else {
            this.showToast(tr.toastCompleted);
          }
        }
        this.saveAppState();
      },
      onHint: (step) => {
        this.lastHintStep = step;
        this.hintsUsed += 1;
        this.saveAppState();
        const loc = localizeStep(step, this.lang);
        if (hintBanner) {
          hintBanner.innerHTML = `<strong>${loc.name}:</strong> ${loc.description}`;
        }
      },
      onNoteModeChange: (active) => {
        const tr = this.t();
        if (noteBtn) noteBtn.classList.toggle('active', active);
        this.saveAppState();
        this.showToast(active ? tr.toastNoteOn : tr.toastNoteOff);
      }
    });

    // Keypad numbers
    document.querySelectorAll('.keypad-btn[data-num]').forEach(btn => {
      btn.addEventListener('click', () => {
        const num = parseInt(btn.dataset.num, 10);
        this.boardUI.inputDigit(num);
      });
    });

    // Action buttons
    const eraseBtn = document.getElementById('btn-erase');
    if (eraseBtn) eraseBtn.addEventListener('click', () => this.boardUI.clearSelectedCell());

    if (noteBtn) {
      noteBtn.addEventListener('click', () => {
        this.boardUI.toggleNoteMode();
      });
    }

    const autoCandBtn = document.getElementById('btn-auto-cand');
    if (autoCandBtn) {
      autoCandBtn.addEventListener('click', () => {
        const active = this.boardUI.toggleAutoCandidates();
        autoCandBtn.classList.toggle('active', active);
        const tr = this.t();
        this.showToast(active ? tr.toastAutoCandOn : tr.toastAutoCandOff);
      });
    }

    const hintBtn = document.getElementById('btn-hint');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        this.boardUI.getHint();
      });
    }

    const checkErrorsBtn = document.getElementById('btn-check-errors');
    if (checkErrorsBtn) {
      checkErrorsBtn.addEventListener('click', () => {
        const res = this.boardUI.checkMistakes();
        const tr = this.t();
        if (res.count === 0) {
          this.showToast(tr.toastNoErrors);
        } else {
          this.showToast(tr.toastErrorsFound(res.count));
        }
      });
    }

    const undoBtn = document.getElementById('btn-undo');
    if (undoBtn) undoBtn.addEventListener('click', () => this.boardUI.undo());

    const redoBtn = document.getElementById('btn-redo');
    if (redoBtn) redoBtn.addEventListener('click', () => this.boardUI.redo());

    const solveBtn = document.getElementById('btn-solve');
    if (solveBtn) {
      solveBtn.addEventListener('click', () => {
        const tr = this.t();
        if (confirm(tr.confirmSolve)) {
          const wasCompleted = this.isCompleted;
          this.boardUI.solveCurrent();
          if (wasCompleted) {
            this.showToast(tr.toastSolved);
          }
        }
      });
    }

    // Difficulty selector buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diff === this.currentDifficulty);
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentDifficulty = btn.dataset.diff;
        this.saveAppState();
      });
    });

    // Daily Challenge button
    const dailyBtn = document.getElementById('btn-daily-challenge');
    if (dailyBtn) {
      dailyBtn.addEventListener('click', () => {
        const tr = this.t();
        const todayStr = getTodayDateString();
        const sched = getDailySchedule(todayStr);
        const dayFull = (tr.dayNamesFull && tr.dayNamesFull[sched.dayOfWeek]) || '';
        const diffMap = {
          easy: tr.diffEasy,
          medium: tr.diffMedium,
          hard: tr.diffHard,
          expert: tr.diffExpert
        };
        const diffLabel = diffMap[sched.targetDifficulty] || sched.targetDifficulty;

        // 1. If already playing Today's Daily Challenge, keep current progress intact
        if (this.isDaily && this.dailyDate === todayStr) {
          this.showToast(tr.toastDailyLoaded(dayFull, diffLabel));
          return;
        }

        // 2. Check if Today's Daily Challenge was already started earlier today
        const savedDaily = this.loadDailyProgress(todayStr);
        if (savedDaily && savedDaily.initialStr && this.boardUI.restoreState(savedDaily)) {
          this.isDaily = true;
          this.dailyDate = todayStr;
          this.currentDifficulty = savedDaily.difficulty || sched.targetDifficulty;
          this.elapsedSeconds = savedDaily.elapsedSeconds || 0;
          this.hintsUsed = savedDaily.hintsUsed || 0;
          this.isCompleted = Boolean(savedDaily.isCompleted);
          this.lastHintStep = null;

          if (noteBtn) noteBtn.classList.toggle('active', Boolean(savedDaily.isNoteMode));
          if (autoCandBtn) autoCandBtn.classList.toggle('active', Boolean(savedDaily.autoCandidatesEnabled));
          document.querySelectorAll('.diff-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.diff === this.currentDifficulty);
          });

          this.updateDailyChallengeUI();
          this.updateBoardStatsText();
          this.saveAppState();
          this.showToast(tr.toastDailyLoaded(dayFull, diffLabel));
          return;
        }

        // 3. Otherwise generate Today's Daily Challenge fresh
        const gen = generateDailyPuzzle(todayStr);
        this.isDaily = true;
        this.dailyDate = todayStr;
        this.currentDifficulty = gen.targetDifficulty;
        this.elapsedSeconds = 0;
        this.hintsUsed = 0;
        this.isCompleted = false;
        this.lastHintStep = null;

        document.querySelectorAll('.diff-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.diff === this.currentDifficulty);
        });

        this.boardUI.loadBoard(gen.puzzle);
        this.updateDailyChallengeUI();

        if (hintBanner) {
          hintBanner.textContent = tr.dailyLoadedBanner(dayFull, diffLabel, gen.cluesCount);
        }
        this.showToast(tr.toastDailyLoaded(dayFull, diffLabel));
      });
    }

    // WhatsApp / Clipboard Share Result button
    const shareBtn = document.getElementById('btn-share-result');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const text = this.getShareSummaryText();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(() => {});
        }
        this.showToast(this.t().toastShareCopied);
      });
    }

    // New Game button
    const newGameBtn = document.getElementById('btn-new-game');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        const tr = this.t();
        newGameBtn.disabled = true;
        this.showToast(tr.toastGenerating);
        setTimeout(() => {
          const gen = generatePuzzle(this.currentDifficulty, true);
          this.isDaily = false;
          this.elapsedSeconds = 0;
          this.hintsUsed = 0;
          this.isCompleted = false;
          this.lastHintStep = null;
          this.boardUI.loadBoard(gen.puzzle);
          this.updateDailyChallengeUI();
          newGameBtn.disabled = false;
          const diffLabel = (tr.difficultyNames && tr.difficultyNames[gen.difficulty]) || gen.difficulty;
          if (hintBanner) hintBanner.textContent = tr.newGameLoadedBanner(diffLabel, gen.cluesCount);
          this.showToast(tr.toastReady(diffLabel, gen.cluesCount));
        }, 30);
      });
    }

    // Custom string input
    const customBtn = document.getElementById('btn-custom-board');
    if (customBtn) {
      customBtn.addEventListener('click', () => {
        const tr = this.t();
        const str = prompt(tr.promptImport);
        if (str) {
          const clean = str.replace(/[^0-9.]/g, '');
          if (clean.length >= 81) {
            this.isDaily = false;
            this.elapsedSeconds = 0;
            this.hintsUsed = 0;
            this.isCompleted = false;
            this.lastHintStep = null;
            this.boardUI.loadBoard(clean.slice(0, 81));
            this.updateDailyChallengeUI();
            this.showToast(tr.toastImported);
          }
        }
      });
    }

    // Export / Debug modal
    const exportBtn = document.getElementById('btn-export-board');
    const modalEl = document.getElementById('export-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const initialInput = document.getElementById('export-initial-str');
    const currentInput = document.getElementById('export-current-str');
    const debugDetails = document.getElementById('export-debug-details');
    const copyInitialBtn = document.getElementById('copy-initial-btn');
    const copyCurrentBtn = document.getElementById('copy-current-btn');

    if (exportBtn && modalEl) {
      exportBtn.addEventListener('click', () => {
        const data = this.boardUI.getExportData();
        if (initialInput) initialInput.value = data.initialStr;
        if (currentInput) currentInput.value = data.currentStr;

        if (debugDetails) {
          const isEs = this.lang === 'es';
          const lines = isEs
            ? [
                `• Soluciones del Tablero Inicial: ${data.initialSols} (${data.initialSols === 1 ? 'Única ✓' : 'Inválido'})`,
                `• Soluciones del Estado Actual: ${data.currentSols} (${data.isSolvable ? 'Resoluble ✓' : 'Sin Salida / Error ✗'})`
              ]
            : [
                `• Initial Puzzle Solutions: ${data.initialSols} (${data.initialSols === 1 ? 'Unique ✓' : 'Invalid'})`,
                `• Current State Solutions: ${data.currentSols} (${data.isSolvable ? 'Solvable ✓' : 'Dead End / Unsolvable ✗'})`
              ];

          if (data.mistakes.length > 0) {
            lines.push(isEs ? `• Errores Detectados (${data.mistakes.length}):` : `• Mistake Details (${data.mistakes.length}):`);
            for (const m of data.mistakes) {
              lines.push(`  - ${m}`);
            }
            lines.push(
              isEs
                ? `💡 Tip: Toca "🔍 Revisar" para marcar los errores en rojo en el tablero.`
                : `💡 Tip: Click "Check Errors" to highlight mistakes in red.`
            );
          } else {
            lines.push(
              isEs
                ? `• Errores: 0 números ingresados chocan con la solución.`
                : `• Mistakes: 0 entered digits conflict with the solution.`
            );
          }
          debugDetails.textContent = lines.join('\n');
        }

        modalEl.classList.add('active');
      });
    }

    if (modalCloseBtn && modalEl) {
      modalCloseBtn.addEventListener('click', () => modalEl.classList.remove('active'));
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) modalEl.classList.remove('active');
      });
    }

    if (copyInitialBtn && initialInput) {
      copyInitialBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(initialInput.value);
        this.showToast(this.t().toastCopiedInitial);
      });
    }

    if (copyCurrentBtn && currentInput) {
      copyCurrentBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(currentInput.value);
        this.showToast(this.t().toastCopiedCurrent);
      });
    }

    // Restore saved game from localStorage if available, otherwise generate initial board
    if (this.savedState && this.savedState.initialStr && this.boardUI.restoreState(this.savedState)) {
      if (noteBtn) noteBtn.classList.toggle('active', Boolean(this.savedState.isNoteMode));
      if (autoCandBtn) autoCandBtn.classList.toggle('active', Boolean(this.savedState.autoCandidatesEnabled));
    } else {
      const initialGen = generatePuzzle('easy', true);
      this.boardUI.loadBoard(initialGen.puzzle);
    }
  }

  initTechniqueVisualizer() {
    const containerEl = document.getElementById('tab-visualizer');
    const boardEl = document.getElementById('visualizer-board');

    this.visualizerUI = new VisualizerUI(
      containerEl,
      boardEl,
      (boardStr) => {
        this.isDaily = false;
        this.elapsedSeconds = 0;
        this.hintsUsed = 0;
        this.isCompleted = false;
        this.lastHintStep = null;
        this.boardUI.loadBoard(boardStr);
        this.updateDailyChallengeUI();
        this.switchTab('tab-play');
        this.showToast(this.t().toastTransferred);
      },
      this.lang
    );

    // Default load X-Wing
    this.visualizerUI.loadTechnique('x_wing');
  }

  initTheorySection() {
    const containerEl = document.getElementById('tab-theory');
    this.theoryUI = new TheoryUI(
      containerEl,
      (boardStr) => {
        this.isDaily = false;
        this.elapsedSeconds = 0;
        this.hintsUsed = 0;
        this.isCompleted = false;
        this.lastHintStep = null;
        this.boardUI.loadBoard(boardStr);
        this.updateDailyChallengeUI();
        this.switchTab('tab-play');
        this.showToast(this.t().toast17Loaded);
      },
      this.lang
    );
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.sudokuApp = new App();

  // Register Offline Service Worker when served over HTTP/HTTPS (PWA)
  if (
    'serviceWorker' in navigator &&
    (window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
