import { MapBuilderPage } from '../../pages/MapBuilderPage';
import { test } from '../baseTest';
import { testData } from '../data/testData';

test.describe('TC-R1-001: Positive Result - Map Generation', () => {
  test('Verify map generation from filtered data (Positive Result)', async ({
    workflowEditorPage,
  }) => {
    test.setTimeout(160000);
    await workflowEditorPage.openDemoTablesPanel();
    await workflowEditorPage.selectDataset(testData.DATASET_STORES);
    await workflowEditorPage.selectDataset(testData.DATASET_STATES);
    await workflowEditorPage.openComponentsTab();
    await workflowEditorPage.dragComponent(
      testData.COMPONENT_FILTER,
      testData.NODE_STATES,
    );
    await workflowEditorPage.connectNodes(
      testData.NODE_STATES,
      testData.NODE_SIMPLE_FILTER,
      'out',
      'source',
    );
    await workflowEditorPage.configureSimpleFilter(testData.FILTER_STATE);
    await workflowEditorPage.runWorkflow();
    await workflowEditorPage.assertWorkflowSuccess();
    await workflowEditorPage.collapseResultsPanel();
    await workflowEditorPage.clearComponentSearch();
    await workflowEditorPage.dragComponent(
      testData.COMPONENT_SPATIAL_FILTER,
      testData.NODE_STORES,
    );
    await workflowEditorPage.connectNodes(
      testData.NODE_SPATIAL_FILTER,
      testData.NODE_SIMPLE_FILTER,
      'filter',
      'match',
    );
    await workflowEditorPage.connectNodes(
      testData.NODE_STORES,
      testData.NODE_SPATIAL_FILTER,
      'out',
      'source',
    );
    await workflowEditorPage.runWorkflow();
    await workflowEditorPage.assertWorkflowSuccess();
    await workflowEditorPage.selectNode(testData.NODE_SPATIAL_FILTER);
    await workflowEditorPage.assertStateColumnContent('CA', 'includes');
    await workflowEditorPage.collapseResultsPanel();
    await workflowEditorPage.clearComponentSearch();
    await workflowEditorPage.dragComponent(
      testData.COMPONENT_MAP,
      testData.NODE_SPATIAL_FILTER,
    );
    await workflowEditorPage.connectNodes(
      testData.NODE_SPATIAL_FILTER,
      testData.NODE_MAP,
      'match',
      'sources',
    );
    await workflowEditorPage.openNodeConfiguration(testData.NODE_MAP);
    await workflowEditorPage.setMapName(testData.MAP_NAME_POSITIVE);
    await workflowEditorPage.runWorkflow();
    await workflowEditorPage.assertWorkflowSuccess();
    await workflowEditorPage.selectNode(testData.NODE_MAP);

    const newMapPageInstance = await workflowEditorPage.openMapInNewTab();
    const mapPageObject = new MapBuilderPage(newMapPageInstance);
    await mapPageObject.validateMapLoaded();
    await newMapPageInstance.close();
  });
});
