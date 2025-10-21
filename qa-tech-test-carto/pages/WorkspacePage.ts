import { Page, expect } from '@playwright/test';

export class WorkspacePage {
    private readonly workflowsLink = this.page.getByRole('link', { name: 'Workflows' });
    private readonly newButton = this.page.getByRole('button', { name: 'New workflow' });
    private readonly newWorkflowButton = 'span:has-text("Create new")';

    constructor(public readonly page: Page) {}

  
    async navigateAndCreateNewWorkflow(): Promise<Page> {
        await this.workflowsLink.click();
        await this.page.waitForURL('**/workflows'); 

        // Promise defined to wait for the new page event
        const workflowEditorPagePromise = this.page.context().waitForEvent('page');

        await this.newButton.click(); 
        await this.page.click(this.newWorkflowButton);

        // resolve the promise to get the new page
        const workflowEditorPage = await workflowEditorPagePromise;

        // wait for the new page to load 
        await workflowEditorPage.waitForURL('**/workflows/*');
        console.log("Successfully navigated to Workflow Editor page.");

        // returns the new page instance
        return workflowEditorPage;
        
    }
}