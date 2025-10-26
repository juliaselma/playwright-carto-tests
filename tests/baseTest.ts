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
    // ⭐ AÑADIR ESTAS LÍNEAS ⭐
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const workspacePage = new WorkspacePage(page); // Ahora workspacePage está definido y se puede usar

    // (Asegúrate de reintroducir la lógica de login si falta)
     console.log('-> Running setupLogin: Performing login and creating new workflow.');

     await homePage.navigateToLogin();
     const email = process.env.USER_EMAIL;
     const password = process.env.USER_PASSWORD;
     if (!email || !password) {
      throw new Error('❌ Congiguration error: USER_EMAIL or USER_PASSWORD is not set in environment variables.');
    }
     await loginPage.login(email, password);
    // ----------------------------------------

    const newWorkflowPage = await workspacePage.navigateAndCreateNewWorkflow();

    console.log(
      '-> Running setupLogin: Performing login and creating new workflow.',
    );

    await use({ editorPage: newWorkflowPage }); // ... (el teardown está ahora en workflowEditorPage, lo cual es correcto)
  },

  workflowEditorPage: async ({ setupLogin }, use) => {
    // ... (cuerpo de workflowEditorPage, el cual ya es correcto)
    const workflowEditorPage = new WorkflowEditorPage(setupLogin.editorPage);
    await use(workflowEditorPage);

    await workflowEditorPage.deleteMap();
    console.log('-> Running cleanup: Deleted created map/workflow.');
  },
});

export { expect } from '@playwright/test';
