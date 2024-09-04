import { test, expect } from '@playwright/test';

test('user params does not exist', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  await expect(page.getByText('user parameter is required.')).toBeVisible();
});

test('user does not exist', async ({ page }) => {
  await page.goto('http://localhost:8080/?user=');

  await expect(page.getByText('Could not resolve to a User.')).toBeVisible();
});

test('Image user search param', async ({ page }) => {
  await page.goto('http://localhost:8080/?user=swfz');

  await expect(page).toHaveScreenshot();
});

test('Image user path param', async ({ page }) => {
  await page.goto('http://localhost:8080/swfz');

  await expect(page).toHaveScreenshot();
});

test('Image user search param and path param', async ({ page }) => {
  // path paramが優先
  await page.goto('http://localhost:8080/swfz?user=octocat');

  await expect(page).toHaveScreenshot();
});

test('Image dark theme', async ({ page }) => {
  await page.goto('http://localhost:8080/swfz?theme=dark');

  await expect(page).toHaveScreenshot();
});