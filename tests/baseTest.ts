import { test as baseTest, Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { WorkspacePage } from '../pages/WorkspacePage';
import { WorkflowEditorPage } from '../pages/WorkflowEditorPage';

type MyFixtures = {
  setupLogin: { editorPage: Page };
  workflowEditorPage: WorkflowEditorPage;
};

export const test = baseTest.extend<MyFixtures>({
  setupLogin: async ({ page }, use) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const workspacePage = new WorkspacePage(page); // Ahora workspacePage está definido y se puede usar

    console.log(
      '-> Running setupLogin: Performing login and creating new workflow.',
    );

    await homePage.navigateToLogin();
    const email = process.env.USER_EMAIL;
    const password = process.env.USER_PASSWORD;
    if (!email || !password) {
      throw new Error(
        '❌ Configuration error: USER_EMAIL or USER_PASSWORD is not set in environment variables.',
      );
    }
    await loginPage.login(email, password);

    const newWorkflowPage = await workspacePage.navigateAndCreateNewWorkflow();

    await use({ editorPage: newWorkflowPage });
  },

  workflowEditorPage: async ({ setupLogin }, use) => {
    const workflowEditorPage = new WorkflowEditorPage(setupLogin.editorPage);
    await use(workflowEditorPage);

    await workflowEditorPage.deleteMap();
    console.log('-> Running cleanup: Deleted created map.');
  },
});

export { expect } from '@playwright/test';
