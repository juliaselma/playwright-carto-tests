import { MapBuilderPage } from '../../pages/MapBuilderPage';
import { test } from '../baseTest';

test.describe('TC-R1-002: Negative Result - Map Generation', () => {
  test('Verify map generation from filtered data (Negative Result)', async ({
    workflowEditorPage,
  }) => {
    test.setTimeout(160000);
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
    await workflowEditorPage.collapseResultsPanel();
    await workflowEditorPage.clearComponentSearch();
    await workflowEditorPage.dragComponent('Spatial Filter', 'retail_stores');
    await workflowEditorPage.connectNodes(
      'Spatial Filter',
      'Simple Filter',
      'filter', // data-handleid="filter"
      'unmatch', // data-handleid="match"
    );
    await workflowEditorPage.runWorkflow();
    await workflowEditorPage.assertWorkflowSuccess();
    await workflowEditorPage.selectNode('Spatial Filter');
    //await workflowEditorPage.assertStateExcludesCA('CA');
    
    await workflowEditorPage.assertStateColumnContent('CA', 'excludes')
    await workflowEditorPage.collapseResultsPanel();
    await workflowEditorPage.clearComponentSearch();
    await workflowEditorPage.dragComponent(
      'Create Builder Map',
      'Spatial Filter',
    );
    await workflowEditorPage.connectNodes(
      'Spatial Filter',
      'Create Builder Map',
      'unmatch', // data-handleid="filter"
      'sources', // data-handleid="match"
    );
    await workflowEditorPage.openNodeConfiguration('Create Builder Map');
    await workflowEditorPage.setMapName('Retail Stores Negative Match Test');
    await workflowEditorPage.runWorkflow();
    await workflowEditorPage.assertWorkflowSuccess();
    await workflowEditorPage.selectNode('Create Builder Map');
    const newMapPageInstance = await workflowEditorPage.openMapInNewTab();
    const mapPageObject = new MapBuilderPage(newMapPageInstance);
    await mapPageObject.validateMapLoaded();
    await newMapPageInstance.close();

    /*
    const mapPage = await workflowEditorPage.openMap();
    
    // VERIFICACIÓN ADICIONAL: Verificar que el mapa tiene datos (puntos visibles)
    // Esto es muy dependiente del styling, pero asegura que la capa está presente.
    const mapLayer = mapPage.locator('[data-layer-name="Layer 1"]'); // El nombre por defecto o el que definiste
    await expect(mapLayer).toBeVisible(); 
     */
  });
});
