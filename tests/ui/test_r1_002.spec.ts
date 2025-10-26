import { MapBuilderPage } from '../../pages/MapBuilderPage';
import { test } from '../baseTest';
import { testData } from '../data/testData'; // Importar los datos

test.describe('TC-R1-002: Negative Result - Map Generation', () => {
    test('Verify map generation from data that DOES NOT meet the criteria', async ({
        workflowEditorPage,
    }) => {
        test.setTimeout(160000); 

        // --- 1. CONFIGURACIÓN INICIAL (Datasets y Simple Filter) ---
        await workflowEditorPage.openDemoTablesPanel();
        await workflowEditorPage.selectDataset(testData.DATASET_STORES);
        await workflowEditorPage.selectDataset(testData.DATASET_STATES);
        
        await workflowEditorPage.openComponentsTab();
        
        // Drag Simple Filter y conexión al estado
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
        await workflowEditorPage.configureSimpleFilter(testData.FILTER_STATE_POSITIVE); // Filtrando por 'California'
        
        await workflowEditorPage.runWorkflow();
        await workflowEditorPage.assertWorkflowSuccess();
        await workflowEditorPage.collapseResultsPanel();
        
        // --- 2. CONFIGURACIÓN SPATIAL FILTER (Conexión Negativa) ---
        await workflowEditorPage.clearComponentSearch();
        
        // Drag Spatial Filter y conexión al nodo de tiendas
        await workflowEditorPage.dragComponent(
            testData.COMPONENT_SPATIAL_FILTER, 
            testData.NODE_STORES 
        );
        
        // Conexión 1: Geometría de filtro (Unmatch del Simple Filter a Filter del Spatial)
        // Usando variables para los nodos
        await workflowEditorPage.connectNodes(
            testData.NODE_SPATIAL_FILTER, 
            testData.NODE_SIMPLE_FILTER, 
            'filter',  // Handle de destino
            'unmatch', // ⭐ Handle de origen: Does Not Meet Criteria ⭐
        );
        
        // Ejecución y validación del Spatial Filter
        await workflowEditorPage.runWorkflow();
        await workflowEditorPage.assertWorkflowSuccess();
        
        // Validación de datos (debe EXCLUIR 'CA')
        await workflowEditorPage.selectNode(testData.NODE_SPATIAL_FILTER);
        await workflowEditorPage.assertStateColumnContent('CA', 'excludes'); 
        await workflowEditorPage.collapseResultsPanel();
        
        // --- 3. CONFIGURACIÓN CREATE BUILDER MAP ---
        await workflowEditorPage.clearComponentSearch();
        
        // Drag Create Builder Map
        await workflowEditorPage.dragComponent(
            testData.COMPONENT_MAP,
            testData.NODE_SPATIAL_FILTER,
        );
        
        // Conexión de salida del Spatial Filter (match) al Create Builder Map
        // NOTA: Si el Spatial Filter solo tiene una salida 'match', se utiliza esa,
        // aunque el resultado provenga de una conexión 'unmatch' anterior.
        await workflowEditorPage.connectNodes(
            testData.NODE_SPATIAL_FILTER,
            testData.NODE_MAP,
            'match', // Salida de datos del Spatial Filter
            'sources',
        );
        
        // Configuración y ejecución final
        await workflowEditorPage.openNodeConfiguration(testData.NODE_MAP);
        await workflowEditorPage.setMapName(testData.MAP_NAME_NEGATIVE); 
        
        await workflowEditorPage.runWorkflow();
        await workflowEditorPage.assertWorkflowSuccess();
        
        // --- 4. VERIFICACIÓN DEL MAPA ---
        await workflowEditorPage.selectNode(testData.NODE_MAP);

        const newMapPageInstance = await workflowEditorPage.openMapInNewTab();
        const mapPageObject = new MapBuilderPage(newMapPageInstance);
        await mapPageObject.validateMapLoaded();
        await newMapPageInstance.close();
    });
});