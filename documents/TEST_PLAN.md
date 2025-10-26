# 🗺️MANUAL TEST PLAN 🛠️:

This document details the Manual Test Cases required to validate the "Create Map Builder component in Workflows" initiative, ensuring compliance with product requirements.

---

## 1. General Information and Context ℹ️

Project: CARTO Workflows

Initiative/ComponentCreate: Map Builder

Objective: Verify that the component correctly generates maps, handles data division (positive/negative), displays clear metadata, and ensures updates with analytical results.

Scope: Functional ✅ , Interface (UI/UX 🎨), and Integration 🔗Testing of the Create Builder Map component.

---

## 2. Test Strategy 🧠

The strategy focuses on the component's functionality and its integration with the analytical workflow.

- ✅ Functional Testing: Validate the ability to create maps from two sources, apply filters, and generate result tables.

- 🔗 Integration Testing: Verify the persistence of the public URL and map updates when preceding nodes change.

- 🎨 UI/UX Testing: Ensure that metadata and source information are clear and accessible to the user.

---

## 3. Test Case Matrix 📋

### 🎯 Requirement 1:

Table Division and Map Creation

A user is able to create a map from two different sources using a filter table and generating a new table with only the rows of the input table that meet the filter criteria and another one with those that do not meet it.

---

### 🎯 Requirement 2:

Clarity of Data Reference (Metadata)

A user must have a clear reference to the data information of the Create Builder Map.

---

### 🎯 Requirement 3:

Persistence and Analytical Update

Requirement 3:

The user is able to ensure that the map stays up to date with the analytical results.

---

### 🧪TC-1 Full Workflow: Positive Result (Data, Metadata, Map & Sync)

Positive Result (Meets Criteria):

Description:

Verify that the complete end-to-end workflow correctly generates and synchronizes a map based on updated spatial criteria. This test validates initial data integrity (Requirement 1), key metadata metrics (Requirement 2), map output (Requirement 2), and the automatic synchronization of the map when the input filter is changed (Requirement 3).

#### I. Setup and Initial Validation (California - CA)
1. Create Workflow: Start the workflow using the retail_stores and usa_states_boundaries datasets.

2. Initial Filter: Configure a Simple Filter to select the geometry for the state of California (CA).

3. Connect Nodes: Connect the Simple Filter's match output to the Spatial Filter's filter input. Connect the retail_stores output to the Spatial Filter's source input.

4. Execute & Metadata Check (R2): Execute the workflow. Select the Spatial Filter node and review key metadata (Rows, Cols, Updated At).

5. Data Validation (R1): The Spatial Filter's result table must only contain data spatially intersecting with California (Validate: the state column must contain 'CA' and tolerate the known bug 'NV').

6. Create Map (R2): Connect the Spatial Filter's match output to the Create Builder Map node.

7. Execute & Get URL (R3 Prep): Execute the Create Builder Map node. Review metadata and retrieve/save the persistent map URL for later use.

8. Open & Validate Map Content: Open the map in a new tab (using the method that relies on the workflow click).

9. Close the map tab.

#### II. Synchronization Cycle (Texas - TX)
10. Update Filter: Modify the configuration of the Simple Filter to select the geometry for the state of Texas (TX).

11. Re-Execute: Execute the complete workflow.

12. Intermediate Data Check: Select the Spatial Filter node and validate that the state column in the result table now correctly reflects only data for 'TX'.

13. Reopen Map (R3): Reopen the exact same map URL (the one saved in step 7) only containing data with state code 'TX'.

14. Close the map tab.

#### Expected result:

A. Data Validation (R1/R2): The Spatial Filter and Map data tables must accurately reflect the currently applied filter (CA in Cycle I, TX in Cycle II).

B. Metadata (R2): The Spatial Filter and Create Builder Map nodes must consistently display visible and correctly populated ROWS, COLS, and Updated At metrics after both executions.

C. Map Synchronization (R3): The map remains persistent at the original URL, and its content automatically updates to reflect the new workflow results (Texas), demonstrating successful synchronization.

---

### 🧪TC-2 Full Workflow: Negative Result (Data Exclusion)

Negative Result (Does Not Meet):

Description:

Verify that the workflow can correctly isolate and process data that DOES NOT meet the spatial criterion, validating data exclusion and metadata integrity.

Steps:

1. Configure the same previous Workflow (Simple Filter on California).

2. Connect the output unmatch of the Simple Filter to the filter input of the Spatial Filter.

3. Execute the workflow.

4. Select the node Spatial Filter and review key metadata.

5. Connect the match output of the Spatial Filter to the Create Builder Map.

6. Execute the Create Builder Map node and review key metadata.

#### Expected result:

A. Data Validation: The result table for the Spatial Filter contains rows that DO NOT intersect with the geometry of California (Validation: the state column must exclude 'CA').

B. Metadata (R2): The Spatial Filter and Create Builder Map nodes must display the ROWS, COLS, and updated at metrics as visible and correctly populated.

C. Map Output: The map is successfully generated and visualizes points of sale outside the California area.

---


#### 🧪TC-R3-001

Description:

Update upon Logic Modification.

Steps:

1. Create a workflow (e.g., Stores in California).
2. Modify the filtering condition in a preceding node (e.g., change filter to "Nevada").
3. Execute the workflow.

Expected result:

The map generated by Create Builder Map must automatically update to reflect the new analytical results (stores in Nevada).

---
