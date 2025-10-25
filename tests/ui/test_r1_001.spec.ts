import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { WorkspacePage } from '../../pages/WorkspacePage';
import { WorkflowEditorPage } from '../../pages/WorkflowEditorPage';
import { HomePage } from '../../pages/HomePage';

// pasar a variables de entorno
const USER_EMAIL = 'juliaselma@gmail.com';

const USER_PASSWORD = 'Dachibb1901$';

test.describe('TC-R1-001: Positive Result - Map Generation', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;
  let workspacePage: WorkspacePage;
  let workflowEditorPage: WorkflowEditorPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    workspacePage = new WorkspacePage(page);

    await homePage.navigateToLogin();
    await loginPage.login(USER_EMAIL, USER_PASSWORD);
    //Capture the new tab opened after creating a new workflow
    const newWorkflowPage = await workspacePage.navigateAndCreateNewWorkflow();

    //reassign the workflowEditorPage to use the new tab
    workflowEditorPage = new WorkflowEditorPage(newWorkflowPage);
  });

  test.afterEach(async () => {
    await workflowEditorPage.deleteMap();
  });

  test('Verify map generation from filtered data (Positive Result)', async () => {
    test.setTimeout(120000);
    await workflowEditorPage.openDemoTablesPanel();
    await workflowEditorPage.selectDataset('retail_stores');
    await workflowEditorPage.selectDataset('usa_states_boundaries');
    await workflowEditorPage.openComponentsTab();
    await workflowEditorPage.dragComponent(
      'Simple Filter',
      'usa_states_boundaries',
    );
    await workflowEditorPage.connectNodes(
      'usa_states_boundaries', // sourceNodeName: El nodo origen
      'Simple Filter', // targetNodeName: El nodo destino
      'out', // sourceHandleId: data-handleid="out" (Salida por defecto del dataset)
      'source', // targetHandleId: data-handleid="source" (Entrada principal del filtro)
    );
    await workflowEditorPage.configureSimpleFilter('California');
    await workflowEditorPage.runWorkflow();
    await workflowEditorPage.assertWorkflowSuccess();
    await workflowEditorPage.clearComponentSearch();
    await workflowEditorPage.dragComponent('Spatial Filter', 'retail_stores');
    await workflowEditorPage.connectNodes(
      'Spatial Filter',
      'Simple Filter',
      'filter', // data-handleid="filter"
      'match', // data-handleid="match"
    );
    await workflowEditorPage.runWorkflow();
    await workflowEditorPage.assertWorkflowSuccess();
    //await workflowEditorPage.connectComponentToNode('Simple Filter', 'Spatial Join');

    //await workflowEditorPage.connectNodes('usa_states_boundaries', 'Simple Filter');

    // PASO 1: Create Workflow with 2 sources (A and B).
    /*
    await workflowEditorPage.addNodeToCanvas('Create Builder Map'); // El componente a probar*/

    // NOTA: En un test real, harías clic en cada 'Data Explorer' para seleccionar el dataset.
    // Usaremos nombres genéricos por ahora.

    /*// PASO 2 & 3: Apply filter and Connect positive output
    // Conectar Fuente A (retail_stores) al filtro
    await workflowEditorPage.connectNodes('Data Explorer (1)', 'Simple Filter'); 
    // Conectar el output *positivo* del filtro al Create Builder Map.
    // Nota: Necesitas la lógica exacta para el output positivo. En Workflows,
    // el filtro a menudo genera dos outputs. Aquí asumimos el primer puerto es el positivo.
    await workflowEditorPage.connectNodes('Simple Filter', 'Create Builder Map');
    
    // PASO 4: Execute and open the map.
    await workflowEditorPage.runWorkflow();

    const mapPage = await workflowEditorPage.openMap();
    
    // VERIFICACIÓN (Expected result): El mapa se genera exitosamente
    await expect(mapPage).toHaveURL(/builder\.carto\.com/);
    await expect(mapPage.locator('.carto-map')).toBeVisible(); 
    
    // VERIFICACIÓN ADICIONAL: Verificar que el mapa tiene datos (puntos visibles)
    // Esto es muy dependiente del styling, pero asegura que la capa está presente.
    const mapLayer = mapPage.locator('[data-layer-name="Layer 1"]'); // El nombre por defecto o el que definiste
    await expect(mapLayer).toBeVisible(); 
    
    // Cierra la pestaña del mapa para limpiar
    await mapPage.close(); */
  });
});
