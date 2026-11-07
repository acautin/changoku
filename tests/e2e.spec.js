import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BUNDLE_ES_PATH = path.resolve(__dirname, '../dist/changoku-es.html');
const SCREENSHOT_DIR = path.resolve(__dirname, '../dist/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const FILE_URL = `file://${BUNDLE_ES_PATH}`;

/**
 * Helper that inspects all visible elements in the page and returns any
 * elements that overflow horizontally beyond the viewport width, or where
 * the 81 Sudoku cells are clipped/overlapping.
 */
async function auditViewportLayout(page) {
  return await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const docScrollWidth = document.documentElement.scrollWidth;
    const overflowing = [];

    const all = document.querySelectorAll('header, main, .tab-pane.active *');
    for (const el of all) {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;

      if (rect.right > vw + 2 || rect.left < -2) {
        overflowing.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          className: el.className || '',
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          vw
        });
      }
    }

    // Check active sudoku board geometry
    const board = document.querySelector('.tab-pane.active .sudoku-board');
    let boardAudit = null;
    if (board) {
      const bRect = board.getBoundingClientRect();
      const cells = board.querySelectorAll('.cell');
      const firstRowCell = board.querySelector('.cell[data-row="0"][data-col="0"]')?.getBoundingClientRect();
      const lastRowCell = board.querySelector('.cell[data-row="8"][data-col="8"]')?.getBoundingClientRect();
      boardAudit = {
        width: Math.round(bRect.width),
        height: Math.round(bRect.height),
        top: Math.round(bRect.top),
        bottom: Math.round(bRect.bottom),
        cellCount: cells.length,
        firstCellHeight: firstRowCell ? Math.round(firstRowCell.height) : 0,
        lastCellHeight: lastRowCell ? Math.round(lastRowCell.height) : 0,
        lastCellBottomDelta: lastRowCell ? Math.round(bRect.bottom - lastRowCell.bottom) : null
      };
    }

    return {
      vw,
      vh,
      docScrollWidth,
      overflowCount: overflowing.length,
      overflowing: overflowing.slice(0, 10),
      boardAudit
    };
  });
}

test.describe('Changoku Focused Visual & Functional Suite', () => {

  test('1. Mobile Portrait (390x844 iPhone) - Play Tab layout, board 9x9 geometry & screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(FILE_URL);
    await page.waitForTimeout(300);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-mobile-portrait-play.png'), fullPage: true });
    const audit = await auditViewportLayout(page);

    expect(audit.docScrollWidth).toBeLessThanOrEqual(audit.vw + 1);
    expect(audit.overflowCount).toBe(0);
    expect(audit.boardAudit.cellCount).toBe(81);
    expect(Math.abs(audit.boardAudit.width - audit.boardAudit.height)).toBeLessThanOrEqual(2);
    expect(Math.abs(audit.boardAudit.firstCellHeight - audit.boardAudit.lastCellHeight)).toBeLessThanOrEqual(2);
    expect(audit.boardAudit.lastCellBottomDelta).toBeGreaterThanOrEqual(-1);
    expect(audit.boardAudit.lastCellBottomDelta).toBeLessThanOrEqual(6);
  });

  test('2. Mobile Landscape (844x390) - Play Tab side-by-side ergonomics & screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto(FILE_URL);
    await page.waitForTimeout(300);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-mobile-landscape-play.png'), fullPage: false });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02b-mobile-landscape-full.png'), fullPage: true });
    const audit = await auditViewportLayout(page);

    expect(audit.docScrollWidth).toBeLessThanOrEqual(audit.vw + 1);
    expect(audit.overflowCount).toBe(0);
    expect(audit.boardAudit.height).toBeLessThanOrEqual(360);
    expect(audit.boardAudit.height).toBeGreaterThanOrEqual(220);
  });

  test('3. Mobile Portrait (390x844) - Technique Visualizer layout & screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(FILE_URL);
    await page.click('.tab-btn[data-tab="tab-visualizer"]');
    await page.waitForTimeout(300);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-mobile-portrait-visualizer.png'), fullPage: true });
    const audit = await auditViewportLayout(page);

    expect(audit.docScrollWidth).toBeLessThanOrEqual(audit.vw + 1);
    expect(audit.overflowCount).toBe(0);
    expect(audit.boardAudit.cellCount).toBe(81);
  });

  test('4. Mobile Portrait (390x844) - Theory & Combinatorics layout & screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(FILE_URL);
    await page.click('.tab-btn[data-tab="tab-theory"]');
    await page.waitForTimeout(300);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-mobile-portrait-theory.png'), fullPage: true });
    const audit = await auditViewportLayout(page);

    expect(audit.docScrollWidth).toBeLessThanOrEqual(audit.vw + 1);
    expect(audit.overflowCount).toBe(0);
  });

  test('5. Language Switcher (ES <-> EN) updates Play, Visualizer, and Theory tabs', async ({ page }) => {
    await page.goto(FILE_URL);

    await expect(page.locator('#btn-hint')).toContainText('Pista');
    await page.click('.tab-btn[data-tab="tab-visualizer"]');
    await expect(page.locator('.tech-list-btn[data-tech-id="naked_single"]')).toContainText('Sencillo Desnudo');

    await page.click('#btn-lang-toggle');
    await expect(page.locator('.tech-list-btn[data-tech-id="naked_single"]')).toContainText('Naked Single');

    await page.click('.tab-btn[data-tab="tab-theory"]');
    await expect(page.locator('#theory-q1-title')).toContainText('Is Sudoku a Solved Game?');

    await page.click('#btn-lang-toggle');
    await expect(page.locator('#theory-q1-title')).toContainText('¿Es el Sudoku un Juego "Resuelto"?');
  });

  test('6. Light / Dark Theme Toggle starts in Day Mode, switches palette, and persists across reload', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(FILE_URL);

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.click('#btn-theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-mobile-portrait-dark.png'), fullPage: false });

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('7. Cell selection, digit entry, keypad remaining counter, erase, and Undo/Redo', async ({ page }) => {
    await page.goto(FILE_URL);

    const emptyCell = page.locator('#play-board .cell:not(.given)').first();
    await emptyCell.click();
    await expect(emptyCell).toHaveClass(/selected/);

    const remBefore = parseInt(await page.locator('.keypad-btn[data-num="5"] .keypad-rem').innerText(), 10);

    await page.click('.keypad-btn[data-num="5"]');
    await expect(emptyCell.locator('.cell-value')).toHaveText('5');
    await expect(emptyCell).toHaveClass(/user-filled/);

    await page.click('#btn-undo');
    await expect(emptyCell.locator('.cell-value')).toHaveText('');
    await page.click('#btn-redo');
    await expect(emptyCell.locator('.cell-value')).toHaveText('5');

    await page.click('#btn-erase');
    await expect(emptyCell.locator('.cell-value')).toHaveText('');
    const remAfter = parseInt(await page.locator('.keypad-btn[data-num="5"] .keypad-rem').innerText(), 10);
    expect(remAfter).toBe(remBefore);
  });

  test('8. LocalStorage Auto-Save restores board and user entries after page reload', async ({ page }) => {
    await page.goto(FILE_URL);

    const emptyCell = page.locator('#play-board .cell:not(.given)').first();
    const cellIdx = await emptyCell.getAttribute('data-index');
    await emptyCell.click();
    await page.click('.keypad-btn[data-num="7"]');
    await expect(emptyCell.locator('.cell-value')).toHaveText('7');

    await page.reload();
    const restoredCell = page.locator(`#play-board .cell[data-index="${cellIdx}"]`);
    await expect(restoredCell.locator('.cell-value')).toHaveText('7');
    await expect(restoredCell).toHaveClass(/user-filled/);
  });

  test('9. Pencil Notes mode & Auto-Candidates toggle', async ({ page }) => {
    await page.goto(FILE_URL);

    const emptyCell = page.locator('#play-board .cell:not(.given)').first();
    await emptyCell.click();

    await page.click('#btn-note-mode');
    await expect(page.locator('#btn-note-mode')).toHaveClass(/active/);

    await page.click('.keypad-btn[data-num="3"]');
    const cand3 = emptyCell.locator('.candidate-num[data-digit="3"]');
    await expect(cand3).toHaveClass(/active/);

    await page.click('#btn-auto-cand');
    await expect(page.locator('#btn-auto-cand')).toHaveClass(/active/);
  });

  test('10. Hint button highlights next logical step and updates localized banner', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.click('#btn-hint');

    const bannerText = await page.locator('#hint-banner').innerText();
    expect(bannerText.length).toBeGreaterThan(15);
    const highlightedCount = await page.locator('#play-board .cell.tech-primary, #play-board .cell.tech-pivot, #play-board .cell.tech-target').count();
    expect(highlightedCount).toBeGreaterThan(0);
  });

  test('11. Check Errors button detects no errors on clean board', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.click('#btn-check-errors');
    await expect(page.locator('.toast')).toContainText('Impecable');
  });

  test('12. Export / Debug Modal displays 81-char initial & current strings and solver status', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.click('#btn-export-board');

    await expect(page.locator('#export-modal')).toHaveClass(/active/);
    const initVal = await page.locator('#export-initial-str').inputValue();
    const currVal = await page.locator('#export-current-str').inputValue();
    expect(initVal.length).toBe(81);
    expect(currVal.length).toBe(81);
    await expect(page.locator('#export-debug-details')).toContainText('Soluciones del Tablero Inicial: 1');

    await page.click('#modal-close-btn');
    await expect(page.locator('#export-modal')).not.toHaveClass(/active/);
  });

  test('13. Technique Visualizer switches techniques and applies deduction', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.click('.tab-btn[data-tab="tab-visualizer"]');

    await page.click('.tech-list-btn[data-tech-id="xy_wing"]');
    await expect(page.locator('#tech-title')).toContainText('XY-Wing');
    await expect(page.locator('#tech-apply-btn')).toBeEnabled();

    await page.click('#tech-apply-btn');
    await expect(page.locator('#tech-apply-btn')).toBeDisabled();
    await expect(page.locator('#tech-description')).toContainText('Deducción Aplicada');
  });

  test('14. Theory Tab 17-clue uniqueness benchmark and transfer to Play board', async ({ page }) => {
    await page.goto(FILE_URL);
    await page.click('.tab-btn[data-tab="tab-theory"]');

    await page.click('#verify-17-clue-btn');
    await expect(page.locator('#verify-17-output')).toContainText('1 solución única');

    await page.click('#load-17-clue-btn');
    await expect(page.locator('#tab-play')).toHaveClass(/active/);
    await expect(page.locator('#board-stats')).toContainText('17/81');
  });

  test('15. Daily Changoku Challenge loads deterministic board, increments streak on solve, and reveals Share button', async ({ page }) => {
    await page.goto(FILE_URL);

    // Click Daily Challenge button
    await page.click('#btn-daily-challenge');
    await expect(page.locator('#btn-daily-challenge')).toContainText('Jugando Desafío de Hoy');

    // Capture the 81-char initial string of today's daily board
    await page.click('#btn-export-board');
    const dailyStr1 = await page.locator('#export-initial-str').inputValue();
    await page.click('#modal-close-btn');

    // Place a digit in the first empty cell of the Daily Challenge
    const emptyDailyCell = page.locator('#play-board .cell:not(.given)').first();
    const emptyDailyIdx = await emptyDailyCell.getAttribute('data-index');
    await emptyDailyCell.click();
    await page.click('.keypad-btn[data-num="9"]');
    await expect(emptyDailyCell.locator('.cell-value')).toHaveText('9');

    // Start a Free Play game ("Nuevo Juego"), then switch back to Today's Daily Challenge
    await page.click('#btn-new-game');
    await expect(page.locator('#btn-daily-challenge')).toContainText('Jugar Desafío de Hoy');
    await page.click('#btn-daily-challenge');

    // Must restore the exact same Daily board AND the user's progress ('9')
    await page.click('#btn-export-board');
    const dailyStr2 = await page.locator('#export-initial-str').inputValue();
    await page.click('#modal-close-btn');
    expect(dailyStr1).toBe(dailyStr2);
    const restoredDailyCell = page.locator(`#play-board .cell[data-index="${emptyDailyIdx}"]`);
    await expect(restoredDailyCell.locator('.cell-value')).toHaveText('9');

    // Solve the Daily Challenge and verify streak increments to 1 and Share button appears
    page.once('dialog', dialog => dialog.accept());
    await page.click('#btn-solve');

    await expect(page.locator('#daily-streak-badge')).toContainText('Racha: 1 día');
    await expect(page.locator('#btn-daily-challenge')).toContainText('Desafío de Hoy Completado');
    await expect(page.locator('#btn-share-result')).toBeVisible();
  });

  test('16. Streak Joker automatically saves a 14-day streak when missing 2 days and shows toast notification', async ({ page }) => {
    await page.goto(FILE_URL);

    // Seed localStorage with a 14-day streak, 2 earned Jokers, and lastCompletedDate 3 days ago (2 missed days)
    await page.evaluate(() => {
      const d = new Date();
      d.setDate(d.getDate() - 3);
      const threeDaysAgo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      localStorage.setItem('changoku_daily_stats_v1', JSON.stringify({
        currentStreak: 14,
        bestStreak: 14,
        lastCompletedDate: threeDaysAgo,
        streakJokers: 2,
        completedDates: [threeDaysAgo]
      }));
    });

    await page.reload();
    await page.click('#btn-daily-challenge');

    page.once('dialog', dialog => dialog.accept());
    await page.click('#btn-solve');

    // Streak should be preserved and incremented to 15 days, and Joker toast should appear
    await expect(page.locator('#daily-streak-badge')).toContainText('Racha: 15 días');
    await expect(page.locator('.toast').last()).toContainText('Comodín aplicado');
  });

});
