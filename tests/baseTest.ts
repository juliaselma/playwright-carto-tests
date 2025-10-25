import { test as baseTest, Page } from '@playwright/test';
// Asegúrate de que las rutas a tus Page Objects sean correctas
import { HomePage } from '../pages/HomePage'; 
import { LoginPage } from '../pages/LoginPage';
import { WorkspacePage } from '../pages/WorkspacePage';
import { WorkflowEditorPage } from '../pages/WorkflowEditorPage'; 

const USER_EMAIL = 'juliaselma@gmail.com';

const USER_PASSWORD = 'Dachibb1901$';

// 1. Definimos los tipos de los fixtures que inyectaremos
type MyFixtures = {
    // page es el fixture base de Playwright
    // El setup de login y navegación a la nueva pestaña
    setupLogin: { editorPage: Page };
    // El Page Object que usaremos en el test
    workflowEditorPage: WorkflowEditorPage; 
};

// 2. Extendemos el test base
export const test = baseTest.extend<MyFixtures>({
    
    // FICTURE AUXILIAR: Maneja la navegación, el login y la apertura de la nueva pestaña
    setupLogin: async ({ page }, use) => {
        // Inicialización de Page Objects que NO se usan en el test final
        const homePage = new HomePage(page);
        const loginPage = new LoginPage(page);
        const workspacePage = new WorkspacePage(page);

        // --- CÓDIGO BEFORE EACH: LOGIN Y CREACIÓN DE WORKFLOW ---
        console.log("-> Corriendo setup: Login e inicio de nuevo Workflow.");
        
        await homePage.navigateToLogin();
        // NOTA: USER_EMAIL y USER_PASSWORD deben estar definidos como variables globales
        await loginPage.login(USER_EMAIL, USER_PASSWORD); 
        
        // Capturar la nueva pestaña abierta después de crear un nuevo workflow
        const newWorkflowPage = await workspacePage.navigateAndCreateNewWorkflow();

        // Ejecutar 'use' con la nueva página. Esto permite al siguiente fixture acceder a ella.
        await use({ editorPage: newWorkflowPage });
        
        // --- CÓDIGO AFTER EACH: LIMPIEZA DE WORKFLOW ---
        // Playwright garantiza que este código se ejecute después de CADA test.
        const workflowEditorPage = new WorkflowEditorPage(newWorkflowPage);
        await workflowEditorPage.deleteMap();
        console.log("-> Corriendo afterEach: Mapa/Workflow eliminado.");
    },

    // FICTURE PRINCIPAL: Inicializa el Page Object del editor usando la nueva pestaña
    workflowEditorPage: async ({ setupLogin }, use) => {
        // Usamos la nueva pestaña obtenida del fixture 'setupLogin'
        const workflowEditorPage = new WorkflowEditorPage(setupLogin.editorPage);
        
        // El resto del beforeEach específico del workflow puede ir aquí si es necesario
        // (Ej: Carga de datasets, etc., pero ya lo tenías en una respuesta anterior)

        // Entregar el objeto listo al test
        await use(workflowEditorPage);
    },
});

export { expect } from '@playwright/test';