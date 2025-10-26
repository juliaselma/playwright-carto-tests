import { MapBuilderPage } from '../../pages/MapBuilderPage';
import { test } from '../baseTest';
import { testData } from '../data/testData';

test.describe('TC-R1/R2-001: Negative Result - Full Validation (Data, Metrics, Map)', () => {
  test('Verify map generation from data that DOES NOT meet the criteria', async ({
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
      'unmatch',
    );
    await workflowEditorPage.runWorkflow();
    await workflowEditorPage.assertWorkflowSuccess();
    await workflowEditorPage.selectNode(testData.NODE_SPATIAL_FILTER);
    await workflowEditorPage.assertStateColumnContent('CA', 'excludes');
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
    await workflowEditorPage.setMapName(testData.MAP_NAME_NEGATIVE);
    await workflowEditorPage.runWorkflow();
    await workflowEditorPage.assertWorkflowSuccess();
    await workflowEditorPage.selectNode(testData.NODE_MAP);

    const newMapPageInstance = await workflowEditorPage.openMapInNewTab();
    const mapPageObject = new MapBuilderPage(newMapPageInstance);
    await mapPageObject.validateMapLoaded();
    await newMapPageInstance.close();
  });
});
