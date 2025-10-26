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
      'usa_states_boundaries',
      'Simple Filter',
      'out',
      'source',
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
      'filter',
      'unmatch',
    );
    await workflowEditorPage.runWorkflow();
    await workflowEditorPage.assertWorkflowSuccess();
    await workflowEditorPage.selectNode('Spatial Filter');
    await workflowEditorPage.assertStateColumnContent('CA', 'excludes');
    await workflowEditorPage.collapseResultsPanel();
    await workflowEditorPage.clearComponentSearch();
    await workflowEditorPage.dragComponent(
      'Create Builder Map',
      'Spatial Filter',
    );
    await workflowEditorPage.connectNodes(
      'Spatial Filter',
      'Create Builder Map',
      'unmatch',
      'sources',
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
  });
});
