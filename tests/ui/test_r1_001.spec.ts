import { MapBuilderPage } from '../../pages/MapBuilderPage';
import { test } from '../baseTest';
import { testData } from '../data/testData'; // Asegúrate de que la ruta sea correcta

test.describe('TC-R1-001: Positive Result - Map Generation', () => {
    test('Verify map generation from filtered data (Positive Result)', async ({
        workflowEditorPage,
    }) => {
        // Aumenta el tiempo de espera para flujos complejos y largos
        test.setTimeout(160000); 

        // --- 1. CONFIGURACIÓN INICIAL (Datasets y Simple Filter) ---
        await workflowEditorPage.openDemoTablesPanel();
        await workflowEditorPage.selectDataset(testData.DATASET_STORES);
        await workflowEditorPage.selectDataset(testData.DATASET_STATES);
        
        await workflowEditorPage.openComponentsTab();
        
        // Drag Simple Filter y conexión al estado
        await workflowEditorPage.dragComponent(
            testData.COMPONENT_FILTER,
            testData.NODE_STATES, // Nodo de destino: usa_states_boundaries
        );
        await workflowEditorPage.connectNodes(
            testData.NODE_STATES,
            testData.NODE_SIMPLE_FILTER,
            'out',
            'source',
        );
        await workflowEditorPage.configureSimpleFilter(testData.FILTER_STATE_POSITIVE);
        
        // Ejecución inicial (Solo filtro de estados)
        await workflowEditorPage.runWorkflow();
        await workflowEditorPage.assertWorkflowSuccess();
        await workflowEditorPage.collapseResultsPanel();
        
        // --- 2. CONFIGURACIÓN SPATIAL FILTER ---
        await workflowEditorPage.clearComponentSearch();
        
        // Drag Spatial Filter y conexión al nodo de tiendas (retail_stores)
        await workflowEditorPage.dragComponent(
            testData.COMPONENT_SPATIAL_FILTER, 
            testData.NODE_STORES // Nodo de destino: retail_stores
        );
        
        // Conexión 1: Geometría de filtro (Match del Simple Filter a Filter del Spatial)
        await workflowEditorPage.connectNodes(
            testData.NODE_SPATIAL_FILTER, // Nodo de origen (Spatial Filter, al revés si es drag and drop)
            testData.NODE_SIMPLE_FILTER, // Nodo de destino
            'filter', // Handle de destino
            'match', // Handle de origen
        );
        
        // Conexión 2: Datos de origen (retail_stores a Source del Spatial Filter)
        await workflowEditorPage.connectNodes(
            testData.NODE_STORES, 
            testData.NODE_SPATIAL_FILTER, 
            'out', 
            'source'
        );
        
        // Ejecución y validación del Spatial Filter
        await workflowEditorPage.runWorkflow();
        await workflowEditorPage.assertWorkflowSuccess();
        
        // Validación de datos (debe incluir 'CA' y tolerar 'NV')
        await workflowEditorPage.selectNode(testData.NODE_SPATIAL_FILTER);
        await workflowEditorPage.assertStateColumnContent('CA', 'includes');
        await workflowEditorPage.collapseResultsPanel();
        
        // --- 3. CONFIGURACIÓN CREATE BUILDER MAP ---
        await workflowEditorPage.clearComponentSearch();
        
        // Drag Create Builder Map
        await workflowEditorPage.dragComponent(
            testData.COMPONENT_MAP,
            testData.NODE_SPATIAL_FILTER,
        );
        
        // Conexión de salida del Spatial Filter (match) al Create Builder Map
        await workflowEditorPage.connectNodes(
            testData.NODE_SPATIAL_FILTER,
            testData.NODE_MAP,
            'match',
            'sources',
        );
        
        // Configuración y ejecución final
        await workflowEditorPage.openNodeConfiguration(testData.NODE_MAP);
        await workflowEditorPage.setMapName(testData.MAP_NAME_POSITIVE);
        
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