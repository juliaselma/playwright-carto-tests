import { Page, expect } from '@playwright/test';

export class LoginPage {
  private readonly emailInput = '#username';
  private readonly passwordInput = '#password';
  private readonly loginButton = 'button:has-text("Continue")';

  constructor(public readonly page: Page) {}

  async login(email: string, password: string) {
    console.log(`Iniciando sesión con ${email}`);
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
    await this.page.waitForURL('https://clausa.app.carto.com/'); 
    const loginHeader = this.page.getByRole('heading', { name: 'Welcome to CARTO' }); 
    await expect(loginHeader).toBeVisible();
    console.log('Successfully logged in');
  }
}