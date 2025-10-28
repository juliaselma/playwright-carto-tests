import { MapBuilderPage } from '../../pages/MapBuilderPage';
import { test } from '../baseTest';
import { testData } from '../data/testData';

test.describe('TC-1: Positive Result - Full Validation (Data, Metrics, Map, Map Synchronization)', () => {
  test('Verify map generation from filtered data (Positive Result)', async ({
    workflowEditorPage,
  }) => {
    test.setTimeout(300000);
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
    await workflowEditorPage.configureSimpleFilter(
      testData.FILTER_STATE_POSITIVE,
    );
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
    await workflowEditorPage.assertStateColumnContent(
      testData.STATE_CODE_POSITIVE,
      'includes',
    );
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
    console.log('---Executing and Validating California Map---');
    await workflowEditorPage.runWorkflow();
    await workflowEditorPage.assertWorkflowSuccess();
    await workflowEditorPage.selectNode(testData.NODE_MAP);
    await workflowEditorPage.assertMapOutputSchema();
    const mapUrl = await workflowEditorPage.getMapOutputUrl();

    const newMapPageInstanceCA =
      await workflowEditorPage.openMapInNewTab(mapUrl);
    const mapPageObjectCA = new MapBuilderPage(newMapPageInstanceCA);
    await mapPageObjectCA.validateMapLoaded();
    await newMapPageInstanceCA.close();

    console.log('---Validating Texas State Update---');
    await workflowEditorPage.selectNode(testData.NODE_SIMPLE_FILTER);
    await workflowEditorPage.configureSimpleFilter(
      testData.FILTER_STATE_UPDATE,
    );
    await workflowEditorPage.runWorkflow();
    await workflowEditorPage.assertWorkflowSuccess();
    await workflowEditorPage.selectNode(testData.NODE_SPATIAL_FILTER);
    await workflowEditorPage.assertStateColumnContent(
      testData.STATE_CODE_UPDATE,
      'includes',
    );
    const mapPageTX = await workflowEditorPage.openMapInNewTab(mapUrl);
    const mapPageObjectTX = new MapBuilderPage(mapPageTX);
    await mapPageObjectTX.validateMapLoaded();
    await mapPageTX.close();
  });
});
