import { MapBuilderPage } from '../../pages/MapBuilderPage';
import { test } from '../baseTest';

test.describe('TC-R1-001: Positive Result - Map Generation', () => {

  test('Verify map generation from filtered data (Positive Result)', async ({ workflowEditorPage }) => {
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
    await workflowEditorPage.collapseResultsPanel();
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
    await workflowEditorPage.collapseResultsPanel();
    await workflowEditorPage.clearComponentSearch();
    await workflowEditorPage.dragComponent(
      'Create Builder Map',
      'Spatial Filter',
    );
    await workflowEditorPage.connectNodes(
      'Spatial Filter',
      'Create Builder Map',
      'match', // data-handleid="filter"
      'sources', // data-handleid="match"
    );
    await workflowEditorPage.openNodeConfiguration('Create Builder Map');
    await workflowEditorPage.setMapName('Retail Stores by Filtered State');
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
