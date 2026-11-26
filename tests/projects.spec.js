import { test, expect } from '@playwright/test';

test.use({
  storageState: 'tests/playwright/.auth/user.json'
});

test('test', async ({ page }) => {
  await page.goto('https://comp229-assignment04.onrender.com/');
  await page.getByRole('link', { name: 'Projects' }).click();
  await page.getByRole('textbox', { name: 'Name' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill('playwright test');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('test project');
  await page.getByRole('textbox', { name: 'Start date' }).fill('2026-11-11');
  await page.getByRole('textbox', { name: 'End date' }).fill('2026-11-28');
  await page.getByRole('button', { name: 'Create' }).click();
});