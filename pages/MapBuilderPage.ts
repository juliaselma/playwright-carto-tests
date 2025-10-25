import { Page} from '@playwright/test';

export class MapBuilderPage {
  private readonly emailInput = '#username';

  constructor(public readonly page: Page) {}

  async validateMapLoaded(): Promise<void> {
    console.log('Validating that the map has loaded...');
    await this.page.getByRole('button', { name: 'open-add-source-button' }).waitFor({ state: 'visible', timeout: 60000 });
    console.log('Map loaded successfully.');
  } 
}
