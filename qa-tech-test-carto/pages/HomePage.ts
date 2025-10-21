import { Page, expect } from '@playwright/test';

export class HomePage {
  private readonly loginButton = 'a:has-text("Log in")';
    constructor(public readonly page: Page) {} 

    async navigateToLogin() {
    console.log('Navigating to log in page');
    await this.page.goto('https://carto.com/'); 
    await this.page.click(this.loginButton);           
    await this.page.waitForURL('**/u/login*'); 
    const loginHeader = this.page.getByRole('heading', { name: 'Log in' }); 
    await expect(loginHeader).toBeVisible();
    console.log('Login page loaded successfully');
  }
}