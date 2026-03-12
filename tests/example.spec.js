// // @ts-check
import { test, expect } from '@playwright/test';
import { time } from 'node:console';

//test.describe.configure({ timeout: 250000 });
//This will set the timeout for all the test cases inside the describe block to 250000 milliseconds. This is useful when we have some test cases that take more time to execute and we don't want them to fail due to timeout.

//test.describe('UI Testing Playground', () => {});
//Add all test cases and common variables inside the describe block. 
// This will help us to run all the test cases in a single test suite and also we can use the common variables inside the describe block.

const url = 'http://www.uitestingplayground.com';


test('should have the correct title', async ({ page }) => {
  await page.goto(url);
  await expect(page).toHaveTitle('UI Test Automation Playground');
});


test('checking the button dynamic id', async ({ page }) => {
  await page.goto(url);
  await page.click('text=Dynamic ID');
  await expect(page.getByRole('button', { name: 'Button with Dynamic ID' })).toBeVisible();
});
// test('checking the button dynamic id', async ({ page }) => {
//   await page.goto(url);
//   await page.click('text=Dynamic ID');
//   await expect(page.getByRole('button', { name: /Dynamic ID/ })).toBeVisible();
// });


test('checking the client side delay', async ({ page }) => {
  await page.goto(url);
  await page.click('text=Client Side Delay');
  await page.click('text=Button Triggering Client Side Logic');
  setTimeout(async () => {
    await expect(page.getByText('Data calculated on the client side.')).toBeVisible();
  }, 15000);
  //{ timeout: 17000 } inside tobeVisible() will set the timeout for that specific assertion
});


test('checking the hidden layers', async ({ page }) => {
  await page.goto(url);
  await page.click('text=Hidden Layers');
  await page.click('id=greenButton');
  page.on('console', async message => {
    console.log(`Console message: ${message.text()}`);
    await expect(message.text()).toContain('Green button pressed');
  });
  await expect(page.locator('#blueButton')).toBeVisible();

  // page.consoleMessages().then(messages => {
  //   messages.forEach(async message => {
  //     console.log(`Console message: ${message.text()}`);
  //     await expect(message.text()).toContain('Green button pressed');
  //   });
  // });
  
});

//-------------------------------------------------------------------------------------
// test('checking the dynamic table', async ({ page }) => {
//   await page.goto(url);
//   await page.click('text=Dynamic Table');
//   const chromeRow = page.locator('div[role="row"]', { hasText: 'Chrome' });
//   const cpuIndex = (await page.locator('div[role="row"] span[role="columnheader"]').allTextContents()).findIndex(h => h.trim() === 'CPU');
//   const chromeCPU = (await chromeRow.locator('span[role="cell"]').nth(cpuIndex).textContent())?.trim();
//   const txt = (await page.locator('.bg-warning').textContent())?.trim();
//   expect(txt).toContain(chromeCPU);
// });
// -------------------------------------------------------------------------------------

async function simpleWay(page) {
  const rows = await page.getByRole("row").all();
  const tableData = [];
  for (const row of rows) {
    const rowValues = await row.locator('[role="cell"], [role="columnheader"]').allTextContents();
    if (rowValues.length > 0) tableData.push(rowValues);
  }
  return tableData;
}
// ------------------------------------------------------------------------------------

async function betterWay(page) {
  const rowLocators = await page.getByRole("row").all();
  return await Promise.all(rowLocators.map(async (row) => {
    const cellLocators = await row.locator('[role="cell"], [role="columnheader"]').all();
    return Promise.all(cellLocators.map((cell) => cell.innerText()));
  })
  );
}
test('checking the dynamic table', async ({ page }) => {
  await page.goto('http://www.uitestingplayground.com/dynamicTable');
  // await page.click('text=Dynamic Table');
  const tableData = await simpleWay(page);
  const header = tableData[0];
  const cpuIndex = header.findIndex(h => h.trim() === 'CPU');
  const chromeRow = tableData.find(row => row[0].trim() === 'Chrome');
  const chromeCPU = chromeRow ? chromeRow[cpuIndex].trim() : null;
  const txt = (await page.locator('.bg-warning').textContent())?.trim();
  expect(txt).toContain(chromeCPU);
});

