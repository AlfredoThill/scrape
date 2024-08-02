import { test, expect, chromium } from '@playwright/test';

test('test', async () => {
  const browser = await chromium.launch({
    downloadsPath: '/tmp',
  });
  const page = await browser.newPage();
  test.setTimeout(3000000); // bump run time if needed
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
  console.log('all', options.length);
  const notCens = options.filter((option) => option.text?.includes('CENS') === false);
  console.log('notCens', notCens.length);

  for (let i = 0; i < options.length; i++) {
    // cens.length
    if (options[i] === undefined) {
      console.log('continue', i);
      continue;
    }
    const { value, text } = options[i];
    if (value && text) {
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
      await download.saveAs(`${text}.xls`);
      console.log('download', text, i);
    } else {
      console.log('error', text, i);
    }
  }
});
