import { test as baseTest, Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { WorkspacePage } from '../pages/WorkspacePage';
import { WorkflowEditorPage } from '../pages/WorkflowEditorPage';

// Custom fixtures
type MyFixtures = {
  setupLogin: { editorPage: Page };
  workflowEditorPage: WorkflowEditorPage;
};

export const test = baseTest.extend<MyFixtures>({
  setupLogin: async ({ page }, use) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const workspacePage = new WorkspacePage(page);

    console.log(
      '-> Running setupLogin: Performing login and creating new workflow.',
    );

    await homePage.navigateToLogin();
    const email = process.env.USER_EMAIL;
    const password = process.env.USER_PASSWORD;
    if (!email || !password) {
      throw new Error(
        '❌ Congiguration error: USER_EMAIL or USER_PASSWORD is not set in environment variables.',
      );
    }
    await loginPage.login(email, password);
    const newWorkflowPage = await workspacePage.navigateAndCreateNewWorkflow();

    //Execute use with the new workflow page, so that fixtures depending on it can use it
    await use({ editorPage: newWorkflowPage });

    const workflowEditorPage = new WorkflowEditorPage(newWorkflowPage);
    // Cleanup after test: delete created map if exists
    await workflowEditorPage.deleteMap();
    console.log('-> Running after each cleanup: Deleted created map.');
  },

  workflowEditorPage: async ({ setupLogin }, use) => {
    // Using the page from setupLogin to create the Page Object
    const workflowEditorPage = new WorkflowEditorPage(setupLogin.editorPage);
    await use(workflowEditorPage);
  },
});

export { expect } from '@playwright/test';
