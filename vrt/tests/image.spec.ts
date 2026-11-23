import { test, expect } from '@playwright/test';

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
// 移転の案内を描き足しても、埋め込み先のレイアウトが崩れないよう画像サイズは変えない
for (const path of ['/swfz', '/?user=swfz', '/swfz?theme=dark']) {
  test(`Image size is unchanged with moved notice: ${path}`, async ({ request }) => {
    const response = await request.get(`http://localhost:8080${path}`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/png');

    const png = await response.body();
    // PNG の IHDR チャンクの幅と高さ
    expect({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) }).toEqual({ width: 670, height: 140 });
  });
}
