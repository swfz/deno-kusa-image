import { test, expect } from '@playwright/test';
import fs from 'fs';

test('user params does not exist', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  await expect(page.getByText('user parameter is required.')).toBeVisible();
});

test('user does not exist', async ({ page }) => {
  await page.goto('http://localhost:8080/?user=');

  await expect(page.getByText('Could not resolve to a User.')).toBeVisible();
});

test('Image', async ({ page }) => {
  const testData = fs.readFileSync('contributions.json', 'utf8');
  await page.route('api.github.com', route => route.fulfill({
    status: 200,
    body: testData,
  }));

  await page.goto('http://localhost:8080/?user=swfz');

  await expect(page).toHaveScreenshot();
});