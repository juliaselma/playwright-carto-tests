import { Page, expect } from '@playwright/test';

export class LoginPage {
  private readonly emailInput = '#username';
  private readonly passwordInput = '#password';
  private readonly loginButton = 'button:has-text("Continue")';

  constructor(public readonly page: Page) {}

  async login(email: string, password: string, carto_app_base_url: string) {
    const workflows_URL = carto_app_base_url;

    if (!workflows_URL) {
      throw new Error(
        '❌CARTO_APP_BASE_URL is not set in environment variables.',
      );
    }
    console.log(`Starting ${email} session login...`);
    await this.page
      .locator(this.emailInput)
      .waitFor({ state: 'visible', timeout: 15000 });
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
    await this.page.waitForURL(workflows_URL);
    const loginHeader = this.page.getByRole('heading', {
      name: 'Welcome to CARTO',
    });
    await expect(loginHeader).toBeVisible();
    console.log('Successfully logged in');
  }
}
