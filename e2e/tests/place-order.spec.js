import { test, expect } from '@playwright/test';

test.describe('Customer order flow', () => {

  test('customer can add an item and place an order', async ({ page }) => {

    // ── 1. Open the menu page ──────────────────────────────────────────────
    await page.goto('/');

    // Wait until at least one menu card has rendered
    // This confirms the frontend loaded AND the backend responded to GET /api/menu
    await page.waitForSelector('.menu-card', { timeout: 15_000 });

    // ── 2. Add the first menu item to the cart ─────────────────────────────
    const firstAddButton = page.locator('.add-btn').first();
    await expect(firstAddButton).toBeVisible();
    await firstAddButton.click();

    // ── 3. Confirm the item appears in the cart panel ──────────────────────
    // The cart panel always visible on the right — wait for a cart-item row
    await page.waitForSelector('.cart-item', { timeout: 5_000 });

    // Grab the item name so we can assert it in the confirmation later
    const itemName = await page.locator('.cart-item-name').first().innerText();

    // ── 4. Place the order ─────────────────────────────────────────────────
    const placeOrderBtn = page.locator('.place-order-btn');
    await expect(placeOrderBtn).toBeEnabled();
    await placeOrderBtn.click();

    // ── 5. Assert the confirmation screen appears ──────────────────────────
    // The cart swaps to a confirmation view showing "Order placed"
    await expect(page.locator('.confirm-title')).toHaveText('Order placed', { timeout: 10_000 });

    // Assert an order ID was returned (format: #123 · EURX.XX)
    await expect(page.locator('.confirm-detail')).toContainText('#');

    // Assert the pay-now and new-order buttons are present
    await expect(page.locator('.pay-now-btn')).toBeVisible();
    await expect(page.locator('.dismiss-btn')).toBeVisible();
  });


  test('placing an empty cart is not possible', async ({ page }) => {

    await page.goto('/');
    await page.waitForSelector('.menu-card', { timeout: 15_000 });

    // Place Order button should be disabled when cart is empty
    const placeOrderBtn = page.locator('.place-order-btn');
    await expect(placeOrderBtn).toBeDisabled();
  });


  test('adding the same item twice increases quantity', async ({ page }) => {

    await page.goto('/');
    await page.waitForSelector('.menu-card', { timeout: 15_000 });

    const firstAddButton = page.locator('.add-btn').first();
    await firstAddButton.click();
    await firstAddButton.click();

    // Quantity value in the cart should show 2
    await expect(page.locator('.qty-value').first()).toHaveText('2');
  });

});
