// Browser flows use an original placeholder to stay independent of publisher uptime.
export async function mockPosterImages(page) {
  await page.route('https://**/*', async (route) => {
    if (route.request().resourceType() === 'image')
      await route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="#233a34"/><circle cx="200" cy="260" r="110" fill="#e4dbb7"/><text x="200" y="440" fill="#e4dbb7" font-size="26" text-anchor="middle">TEST POSTER</text></svg>',
      });
    else await route.continue();
  });
}
