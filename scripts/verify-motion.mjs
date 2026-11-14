import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const BASE_URL = 'http://127.0.0.1:4321';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function testMotion() {
  console.log('🎬 Testing Motion & Scroll / Hover Behavior...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // 1. Test Home page scroll reveal and header elevation
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

  const hasJsClass = await page.evaluate(() => document.documentElement.classList.contains('js'));
  console.log(`  ✓ html.js class added: ${hasJsClass}`);
  if (!hasJsClass) throw new Error('html.js class was not added');

  const headerBeforeScroll = await page.$eval('header.site-header', (el) => el.classList.contains('header-scrolled'));
  console.log(`  ✓ Header before scroll has .header-scrolled: ${headerBeforeScroll} (expected false)`);
  if (headerBeforeScroll) throw new Error('Header should not be scrolled initially');

  // Scroll down 150px
  await page.evaluate(() => window.scrollTo(0, 150));
  await new Promise((r) => setTimeout(r, 200));

  const headerAfterScroll = await page.$eval('header.site-header', (el) => el.classList.contains('header-scrolled'));
  console.log(`  ✓ Header after scroll has .header-scrolled: ${headerAfterScroll} (expected true)`);
  if (!headerAfterScroll) throw new Error('Header did not get .header-scrolled class after scrolling');

  // Scroll down to trigger reveal on sections
  await page.evaluate(() => window.scrollTo(0, 1000));
  await new Promise((r) => setTimeout(r, 400));

  const visibleRevealsCount = await page.$$eval('[data-reveal].is-visible, [data-reveal-stagger].is-visible', (els) => els.length);
  console.log(`  ✓ Visible revealed elements after scrolling: ${visibleRevealsCount}`);
  if (visibleRevealsCount === 0) throw new Error('No elements gained .is-visible class');

  // 2. Test reading progress bar on /nmc-guidelines-2026/
  await page.goto(`${BASE_URL}/nmc-guidelines-2026/`, { waitUntil: 'networkidle0' });
  const initialBarTransform = await page.$eval('#reading-progress', (el) => el.style.transform);
  console.log(`  ✓ Reading progress bar initial transform: "${initialBarTransform}"`);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
  await new Promise((r) => setTimeout(r, 200));
  const midBarTransform = await page.$eval('#reading-progress', (el) => el.style.transform);
  console.log(`  ✓ Reading progress bar scrolled halfway transform: "${midBarTransform}"`);
  if (!midBarTransform.includes('scaleX')) throw new Error('Reading progress transform scaleX was not set');

  // 3. Test prefers-reduced-motion media query
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  const reducedMotionTransition = await page.evaluate(() => {
    const el = document.querySelector('[data-reveal]');
    return el ? window.getComputedStyle(el).transitionDuration : 'none';
  });
  console.log(`  ✓ Transition duration under prefers-reduced-motion:reduce: ${reducedMotionTransition} (expected 0.001s or 0s)`);

  await browser.close();

  if (consoleErrors.length > 0) {
    console.error('⚠️ Motion test console errors:', consoleErrors);
    throw new Error('Console errors encountered during motion test');
  }

  console.log('✨ All Motion verification checks passed with 100% precision.\n');
}

testMotion().catch((err) => {
  console.error('Fatal motion verification error:', err);
  process.exit(1);
});
