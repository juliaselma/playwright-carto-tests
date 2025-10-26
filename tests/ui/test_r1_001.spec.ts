import { MapBuilderPage } from '../../pages/MapBuilderPage';
import { test } from '../baseTest';

test.describe('TC-R1-001: Positive Result - Map Generation', () => {
  test('Verify map generation from filtered data (Positive Result)', async ({
    workflowEditorPage,
  }) => {
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
      'match',
    );
    await workflowEditorPage.runWorkflow();
    await workflowEditorPage.assertWorkflowSuccess();
    await workflowEditorPage.selectNode('Spatial Filter');
    await workflowEditorPage.assertStateColumnContent('CA', 'includes');
    await workflowEditorPage.collapseResultsPanel();
    await workflowEditorPage.clearComponentSearch();
    await workflowEditorPage.dragComponent(
      'Create Builder Map',
      'Spatial Filter',
    );
    await workflowEditorPage.connectNodes(
      'Spatial Filter',
      'Create Builder Map',
      'match',
      'sources',
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
  });
});
