import { test as baseTest, Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { WorkspacePage } from '../pages/WorkspacePage';
import { WorkflowEditorPage } from '../pages/WorkflowEditorPage';

const USER_EMAIL = 'juliaselma@gmail.com';

const USER_PASSWORD = 'Dachibb1901$';

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
    await loginPage.login(USER_EMAIL, USER_PASSWORD);
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
