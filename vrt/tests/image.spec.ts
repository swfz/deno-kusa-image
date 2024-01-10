import { test, expect } from '@playwright/test';

test('user params does not exist', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  await expect(page.getByText('user parameter is required.')).toBeVisible();
});

test('user does not exist', async ({ page }) => {
  await page.goto('http://localhost:8080/?user=');

  await expect(page.getByText('Could not resolve to a User.')).toBeVisible();
});

test('Image', async ({ page }) => {
  await page.goto('http://localhost:8080/?user=swfz');

  await expect(page).toHaveScreenshot();
});