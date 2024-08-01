const puppetier = require('puppeteer');
const fs = require('fs');

async function scrape() {
  const browser = await puppetier.launch({
    headless: false,
    args: ['--disable-setuid-sandbox'],
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: './' });

  await page.goto('http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/');
  await page.locator('input[name="signin\\[username\\]"]').fill('CENS');
  await page.locator('input[name="signin\\[password\\]"]').fill('1234');

  //await page.locator('input[name="signin\\[captcha\\]"]').click();
  // await page.locator('text=Ingrese con su usuario SGE').click();
  await page.waitForNavigation({
    url: 'http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/',
  });

  await page.locator('text=Formulario T Web').click();
  await page.waitForNavigation({
    url: 'http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/designacion/dashboardDesignacion',
  });

  await page.locator('text=Acto Público').click();

  await page.waitForNavigation({
    url: 'http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/designacion_responsable_acto_publico',
  });

  const select = await page.locator('select[name="formut_filters\\[establecimientos\\]"]').waitHandle();
  const options = await select?.$$eval('option', (options) =>
    options.map((option) => ({ value: option.value, text: option.textContent }))
  );
  const cens = options.filter((option) => option?.text?.includes('CENS'));

  // OR cens.length
  for (let i = 0; i < 5; i++) {
    const { value, text } = cens[i];
    if (value && text && text.includes('CENS')) {
      if (i > 0) {
        await page.goto('http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/designacion_responsable_acto_publico');
      }

      await (await page.locator('select[name="formut_filters\\[establecimientos\\]"]').waitHandle()).select(value);

      await page.locator('text=Buscar').click();
      await page.waitForNavigation({
        url: 'http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/designacion_responsable_acto_publico',
      });

      await page.locator('text=Formulario T Web').click();
      await page.waitForNavigation({
        url: 'http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/designacion/dashboardDesignacion',
      });

      await page.goto('http://sistemas1.buenosaires.edu.ar/wsad/frontend.php/designacion');

      const downloadBtn = page.locator('text=Exportar a Excel');
      await downloadBtn.click();
      await wait(5000);
    }
  }
}
scrape();

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
