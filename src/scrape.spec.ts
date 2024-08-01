import { test, expect, chromium } from '@playwright/test';

test('test', async () => {
  const browser = await chromium.launch({
    downloadsPath: '/tmp',
  });
  const page = await browser.newPage();
  test.setTimeout(120000); // bump run time if needed
  await page.goto('http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/');
  await page.locator('input[name="signin\\[username\\]"]').fill('CENS');
  await page.locator('input[name="signin\\[password\\]"]').fill('1234');

  //await page.locator('input[name="signin\\[captcha\\]"]').click();
  // await page.locator('text=Ingrese con su usuario SGE').click();

  await expect(page).toHaveURL('http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/');

  await page.locator('text=Formulario T Web').click();
  await expect(page).toHaveURL(
    'http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/designacion/dashboardDesignacion'
  );

  await page.locator('text=Acto Público').click();
  await expect(page).toHaveURL(
    'http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/designacion_responsable_acto_publico'
  );

  const select = await page.locator('select[name="formut_filters\\[establecimientos\\]"]').elementHandle();
  const options = await select?.$$eval('option', (options) =>
    options.map((option) => ({ value: option.value, text: option.textContent }))
  )!;
  const cens = options.filter((option) => option?.text?.includes('CENS'));

  for (let i = 0; i < 5; i++) {
    // cens.length
    const { value, text } = cens[i];
    if (value && text && text.includes('CENS')) {
      if (i > 0) {
        await page.goto('http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/designacion_responsable_acto_publico');
      }

      await page.locator('select[name="formut_filters\\[establecimientos\\]"]').selectOption(value);

      await page.locator('text=Buscar').click();
      await expect(page).toHaveURL(
        'http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/designacion_responsable_acto_publico'
      );

      await page.locator('text=Formulario T Web').click();
      await expect(page).toHaveURL(
        'http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/designacion/dashboardDesignacion'
      );

      await page.goto('http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/designacion');

      const downloadPromise = page.waitForEvent('download');
      await page.locator('text=Exportar a Excel').click();
      const download = await downloadPromise;
      await download.saveAs(`download-${i}.xlsx`);
    }
  }
});
