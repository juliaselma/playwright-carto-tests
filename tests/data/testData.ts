interface WorkflowData {
    DATASET_STORES: string;
    DATASET_STATES: string;
    FILTER_STATE: string; 
    COMPONENT_FILTER: string;
    COMPONENT_SPATIAL_FILTER: string;
    COMPONENT_MAP: string;
    MAP_NAME_POSITIVE: string;
    MAP_NAME_NEGATIVE: string;
    NODE_STORES: string;
    NODE_STATES: string;
    NODE_SIMPLE_FILTER: string;
    NODE_SPATIAL_FILTER: string;
    NODE_MAP: string;
}

export const testData: WorkflowData = {
    DATASET_STORES: 'retail_stores',
    DATASET_STATES: 'usa_states_boundaries',
    FILTER_STATE: 'California',
    COMPONENT_FILTER: 'Simple Filter',
    COMPONENT_SPATIAL_FILTER: 'Spatial Filter',
    COMPONENT_MAP: 'Create Builder Map',
    MAP_NAME_POSITIVE: 'Retail Stores by Filtered State',
    MAP_NAME_NEGATIVE: 'Retail_Stores_Negative_Match_Test',
    NODE_STORES: 'retail_stores',
    NODE_STATES: 'usa_states_boundaries',
    NODE_SIMPLE_FILTER: 'Simple Filter',
    NODE_SPATIAL_FILTER: 'Spatial Filter',
    NODE_MAP: 'Create Builder Map',
};