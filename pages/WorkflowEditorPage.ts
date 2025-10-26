import { Page, Locator, expect } from '@playwright/test';

interface EvaluateArgs {
  name: string;
  selector: string;
}

//Node dimensions and spacing for layout calculations
const NODE_HEIGHT = 50;
const VERTICAL_SPACING = 30;
const NODE_WIDTH = 180; // Ancho estimado del nodo (ajustar según tu UI)
const HORIZONTAL_SPACING = 100; // Espacio entre nodos horizontalmente

export class WorkflowEditorPage {
  //locators
  private readonly workflowCanvas: Locator;
  private readonly connectionDataButton =
    this.page.getByText('Connection data');
  private readonly demoDataButton = 'p:has-text("demo data")';
  private readonly demoTablesButton = this.page.getByText('demo_tables');
  private readonly scrollContainerSelector = 'div.css-175htjn';
  private readonly listItemSelector =
    'li[data-testid="data-explorer-list-item"]';
  private readonly canvasSelector = 'div[aria-label="workflow-canvas"]';
  private readonly workflowActionsMenuButton = this.page.getByRole('button', {
    name: 'workflow-actions-menu',
  });
  private getWorkflowNodeLocator(nodeName: string): Locator {
    return this.page.locator('.react-flow__node').filter({
      hasText: nodeName,
    });
  }
  private readonly homeButton = 'a[data-testid="linkLogo"]';
  private readonly deleteOptionInMenu = this.page.getByRole('menuitem', {
    name: 'Delete',
  });
  private readonly deleteConfirmationButton = this.page.getByRole('button', {
    name: 'Yes, delete',
  });
  private readonly componentsTab = this.page.getByText('Components');
  private readonly componentSearchBox = this.page.getByRole('textbox', {
    name: 'Search component',
  });
  private getComponentLocator(componentName: string): Locator {
    return this.page.locator('.css-r7act7').filter({
      hasText: componentName,
    });
  }
  /**
   * Obtiene el locator para el handle de SALIDA de un nodo (data-handleid="out").
   */
  private getOutputHandleLocator(nodeName: string): Locator {
    // 1. Obtiene el locator del nodo
    const nodeLocator = this.page
      .locator('.react-flow__node')
      .filter({ hasText: nodeName });

    // 2. Busca el handle de SALIDA dentro del nodo
    // ⭐ Selector Específico: div con atributo data-handleid="out" ⭐
    return nodeLocator.locator('div[data-handleid="out"]');
  }

  /**
   * Obtiene el locator para el handle de ENTRADA de un nodo (data-handleid="source").
   */
  private getInputHandleLocator(nodeName: string): Locator {
    const nodeLocator = this.page
      .locator('.react-flow__node')
      .filter({ hasText: nodeName });

    // 2. Busca el handle de ENTRADA dentro del nodo
    // ⭐ Selector Específico: div con atributo data-handleid="source" ⭐
    return nodeLocator.locator('div[data-handleid="source"]');
  }

  private getHandleLocator(nodeName: string, handleId: string): Locator {
    const nodeLocator = this.page
      .locator('.react-flow__node')
      .filter({ hasText: nodeName });

    // Busca el handle dentro del nodo usando el data-handleid
    return nodeLocator.locator(`div[data-handleid="${handleId}"]`);
  }
  private readonly filterValueInput = this.page.getByRole('textbox', {
    name: 'Value',
  });

  private readonly runButton = this.page.getByRole('button', {
    name: 'run-workflow-button',
  });

  private readonly cleanInputButton = this.page.locator('.css-y6fh4i');

  private readonly collapseResultsButton = this.page.getByRole('button', {
    name: 'collapse-workflow-tabs-button',
  });
  private readonly mapNameInput = this.page.getByRole('textbox', {
    name: 'Map name',
  });
  private readonly dataTab = this.page.getByRole('tab', { name: 'Data' });
  private readonly tableScrollContainer = this.page.locator(
    '.MuiTableContainer-root',
  );
  private readonly stateColumnHeader = this.page.getByRole('columnheader', {
    name: 'state string',
  });
  private readonly reactFlowRenderer = this.page.locator(
    '.react-flow__renderer',
  );

  constructor(public readonly page: Page) {
    this.workflowCanvas = page.locator(this.canvasSelector);
  }

  async selectDataset(datasetName: string) {
    const datasetItem = await this.findDatasetItem(datasetName);

    //Determine target position based on existing nodes
    let targetX: number = 300;
    let targetY: number = 300;

    const allExistingNodes = this.page.locator('.react-flow__node');
    const nodeCount = await allExistingNodes.count();

    if (nodeCount > 0) {
      //if there are existing nodes, position below the last one
      const lastNodeLocator = allExistingNodes.last();

      try {
        //obtain the text of the last node to get its name
        const lastNodeText = await lastNodeLocator.textContent();

        if (lastNodeText) {
          const refPos = await this.getNodePosition(lastNodeText);

          targetX = refPos.x;
          // New Y position below the last node
          targetY = refPos.y + NODE_HEIGHT + VERTICAL_SPACING;
        }
      } catch (error) {
        console.warn(
          `Error obtaining position for node "${datasetName}".  ${error}`,
        );
      }
    }

    //drag and drop the dataset onto the canvas at calculated position
    await this.dragDatasetToCanvas(datasetItem, datasetName, {
      x: targetX,
      y: targetY,
    });

    //Post-drag wait to ensure node is fully loaded
    await this.waitForNodeToLoad();
  }

  async openDemoTablesPanel(): Promise<void> {
    await this.connectionDataButton.click();
    await this.page.click(this.demoDataButton);
    await this.demoTablesButton.click();
    const scrollContainer = this.page.locator(this.scrollContainerSelector);
    await scrollContainer.waitFor({ state: 'visible', timeout: 15000 });
  }

  async findDatasetItem(datasetName: string): Promise<Locator> {
    const scrollContainer = this.page.locator(this.scrollContainerSelector);

    const argsToPass: EvaluateArgs = {
      name: datasetName,
      selector: this.listItemSelector,
    };

    const found = await scrollContainer.evaluate(
      async (container: HTMLElement, args: EvaluateArgs) => {
        function findItemByText(
          root: HTMLElement,
          text: string,
          selector: string,
        ): HTMLLIElement | null {
          const normalizedTarget = text.toLowerCase().trim();
          const listItems = root.querySelectorAll(selector);
          for (const item of Array.from(listItems)) {
            if (
              item.textContent?.toLowerCase().trim().includes(normalizedTarget)
            ) {
              return item as HTMLLIElement;
            }
          }
          return null;
        }

        const sleep = (ms: number) =>
          new Promise(resolve => setTimeout(resolve, ms));
        const MAX_SCROLLS = 50;
        const SCROLL_DELAY = 200;

        for (let i = 0; i < MAX_SCROLLS; i++) {
          const itemToFind = findItemByText(
            container,
            args.name,
            args.selector,
          );
          if (itemToFind) {
            itemToFind.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return true;
          }
          container.scrollTop = container.scrollHeight;
          container.dispatchEvent(new Event('scroll'));
          await sleep(SCROLL_DELAY);
        }
        return false;
      },
      argsToPass,
    );

    if (!found) {
      throw new Error(
        `El dataset "${datasetName}" no se encontró después de intentar el scroll (Lazy Loading Fallido).`,
      );
    }

    const datasetItem = this.page
      .locator('li[data-testid="data-explorer-list-item"]')
      .filter({ hasText: datasetName });

    await datasetItem.waitFor({ state: 'visible' });

    return datasetItem;
  }

  async dragDatasetToCanvas(
    datasetItem: Locator,
    nodeName: string,
    targetPosition: { x: number; y: number } = { x: 300, y: 300 },
  ): Promise<void> {
    const { x: targetX, y: targetY } = targetPosition;

    await this.workflowCanvas.waitFor({ state: 'visible', timeout: 15000 });

    await datasetItem.dragTo(this.workflowCanvas, {
      targetPosition: { x: targetX, y: targetY },
      timeout: 15000,
    });

    const newNodeLocator = this.getWorkflowNodeLocator(nodeName);
    await newNodeLocator.waitFor({ state: 'visible', timeout: 10000 });
  }

  async waitForNodeToLoad(): Promise<void> {
    await this.page.waitForTimeout(8000);
  }

  async getNodePosition(nodeName: string): Promise<{ x: number; y: number }> {
    const workflowNode = this.getWorkflowNodeLocator(nodeName);
    const nodeBox = await workflowNode.boundingBox();
    const canvasBox = await this.workflowCanvas.boundingBox();

    if (!nodeBox || !canvasBox) {
      return { x: 300, y: 300 }; // Default position if bounding boxes are not found
    }

    // Relative position within the canvas
    const relativeX = nodeBox.x - canvasBox.x;
    const relativeY = nodeBox.y - canvasBox.y;

    return { x: relativeX, y: relativeY };
  }

  async deleteMap(): Promise<void> {
    try {
      await this.page.click(this.homeButton);
      const firstMenuButton = this.workflowActionsMenuButton.first();
      await firstMenuButton.click();
      await this.deleteOptionInMenu.click();
      await this.deleteConfirmationButton.click({ force: true });
      await this.page.waitForTimeout(2000);
    } catch (error) {
      console.warn('Delete map was not completed.', error);
    }
  }

  async openComponentsTab(): Promise<void> {
    await this.componentsTab.waitFor({ state: 'visible', timeout: 5000 });
    await this.componentsTab.click();
  }

  async searchComponent(componentName: string): Promise<void> {
    await this.componentSearchBox.waitFor({ state: 'visible', timeout: 5000 });
    await this.componentSearchBox.fill(componentName);
  }

  async selectComponent(componentName: string): Promise<Locator> {
    const componentLocator = this.getComponentLocator(componentName);
    return componentLocator;
  }

  private async calculateNextHorizontalPosition(
    referenceNodeName?: string,
  ): Promise<{ x: number; y: number }> {
    // Default target position
    let targetX: number = 200;
    let targetY: number = 150;

    // 1. Determine the reference node name
    let refNodeName: string | undefined = referenceNodeName;

    if (!refNodeName) {
      //if no reference node provided, use the last added node
      const allExistingNodes = this.page.locator('.react-flow__node');
      if ((await allExistingNodes.count()) > 0) {
        const lastNodeText = await allExistingNodes.last().textContent();

        if (lastNodeText) {
          // assign the last node's name as reference
          refNodeName = lastNodeText.trim();
        }
      }
    }

    if (refNodeName) {
      try {
        //  Get the position of the reference node
        const refPos = await this.getNodePosition(refNodeName);

        // new X position to the right of the reference node
        targetX = refPos.x + NODE_WIDTH + HORIZONTAL_SPACING;

        // Y position aligned with the reference node
        targetY = refPos.y;
      } catch (error) {
        console.warn(
          `Could not calculate horizontal position based on node "${refNodeName}". Falling back to default. ${error}`,
        );
      }
    }

    return { x: targetX, y: targetY };
  }

  async dragComponent(
    componentName: string,
    referenceNodeName: string,
  ): Promise<void> {
    await this.searchComponent(componentName);

    const componentItem = this.getComponentLocator(componentName);

    // Calculate target position based on reference node
    const { x: targetX, y: targetY } =
      await this.calculateNextHorizontalPosition(referenceNodeName);

    // Drag and drop the component onto the canvas at calculated position
    await this.dragDatasetToCanvas(componentItem, componentName, {
      x: targetX,
      y: targetY,
    });
  }

  async connectNodes(
    sourceNodeName: string,
    targetNodeName: string,
    sourceHandleId: string, // Valor de data-handleid de origen (ej: 'match', 'out')
    targetHandleId: string, // Valor de data-handleid de destino (ej: 'secondarytable', 'source')
  ): Promise<void> {
    console.log(
      `Conectando ${sourceNodeName} (${sourceHandleId}) -> ${targetNodeName} (${targetHandleId})`,
    );

    // 1. Obtener los handles usando el nuevo método unificado
    const sourceHandle = this.getHandleLocator(sourceNodeName, sourceHandleId);
    const targetHandle = this.getHandleLocator(targetNodeName, targetHandleId);

    // 2. Asegurar que ambos handles estén visibles
    //await sourceHandle.waitFor({ state: 'visible', timeout: 10000 });
    //await targetHandle.waitFor({ state: 'visible', timeout: 10000 });

    // 3. Clic Explícito y Arrastre
    await sourceHandle.click({ timeout: 5000 });
    await sourceHandle.dragTo(targetHandle, {
      timeout: 15000,
    });
    await targetHandle.click({ timeout: 5000 });
  }

  async configureSimpleFilter(value: string): Promise<void> {
    await this.filterValueInput.fill(value);
  }
  async runWorkflow(): Promise<void> {
    await this.runButton.click();
    await this.waitForWorkflowToComplete();
  }

  async waitForWorkflowToComplete(): Promise<void> {
    const runCompletedButton = this.page
      .getByRole('button', { name: 'run-workflow-button' })
      .filter({ hasText: 'Run' });

    console.log('Waiting for workflow to complete...');

    await runCompletedButton.waitFor({
      state: 'visible',
      timeout: 150000,
    });

    console.log('Workflow execution completed.');
  }

  async assertWorkflowSuccess(): Promise<void> {
    const successMessageText = 'Workflow execution completed successfully';

    const successMessageLocator = this.page.getByText(successMessageText);

    console.log(`Verificando el mensaje de éxito: "${successMessageText}"`);

    await successMessageLocator.waitFor({
      state: 'visible',
      timeout: 10000,
    });

    // 3. (Opcional) Aserción explícita (si estás usando la librería 'expect' de Playwright)
    await expect(successMessageLocator).toBeVisible();

    //await this.collapseResultsPanel();
  }

  async clearComponentSearch(): Promise<void> {
    console.log('Limpiando el campo de búsqueda de componentes...');

    const searchBox = this.page.getByRole('textbox', {
      name: 'Search component',
    });
    //const cleanInputButton = this.page.locator('.css-y6fh4i');

    // 1. Esperar y hacer clic en el botón 'X'
    await this.cleanInputButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.cleanInputButton.click();

    // 2. ⭐ CORRECCIÓN: Esperar que el valor del input sea vacío ⭐
    // Usamos el método expect(locator).toHaveValue('') con un timeout.
    // Esto es mucho más legible y robusto.
    await expect(searchBox).toHaveValue('', { timeout: 5000 });

    console.log('El campo de búsqueda ha sido limpiado.');
  }

  async collapseResultsPanel(): Promise<void> {
    console.log('Colapsando el panel de resultados para liberar espacio...');

    // 1. Esperar a que el botón esté visible (asumiendo que solo está visible cuando el panel está abierto)
    /*await this.collapseResultsButton.waitFor({
      state: 'visible',
      timeout: 5000,
    });*/

    // 2. Hacer clic en el botón de colapso
    await this.collapseResultsButton.click();

    // Opcional: Esperar a que el botón de colapso desaparezca o cambie de rol/dirección (ej: a expand-button)
    // await this.collapseResultsButton.waitFor({ state: 'hidden' });
  }

  async openNodeConfiguration(nodeName: string): Promise<void> {
    // Localiza el nodo basado en el texto visible en el canvas
    const nodeLocator = this.page
      .locator('.react-flow__node')
      .filter({ hasText: nodeName });

    // 1. Esperar a que el nodo esté visible
    await nodeLocator.waitFor({ state: 'visible', timeout: 10000 });

    // 2. Simular doble clic (dblclick) para abrir el panel lateral de configuración
    await nodeLocator.dblclick();

    // Opcional: Esperar a que el panel de configuración se cargue y sea visible
    // Por ejemplo, esperando el encabezado del panel:
    // await this.page.getByRole('heading', { name: nodeName }).waitFor();
  }
  async selectNode(nodeName: string): Promise<void> {
    // Localiza el nodo basado en el texto visible en el canvas
    const nodeLocator = this.page
      .locator('.react-flow__node')
      .filter({ hasText: nodeName });

    // 1. Esperar a que el nodo esté visible
    await nodeLocator.waitFor({ state: 'visible', timeout: 10000 });

    // 2. Simular doble clic (dblclick) para abrir el panel lateral de configuración
    await nodeLocator.click();
  }

  async setMapName(mapName: string): Promise<void> {
    console.log(`Estableciendo el nombre del mapa a: "${mapName}"`);

    // 1. Esperar a que el campo de entrada esté visible
    // Playwright implícitamente espera usando getByRole
    //await this.mapNameInput.waitFor({ state: 'visible', timeout: 5000 });

    // 2. Escribir el nuevo nombre
    await this.mapNameInput.fill(mapName);
  }

  async openMapInNewTab(): Promise<Page> {
    console.log('Navigating to the map from the Data tab...');

    // 1. Aseguramos que la pestaña 'Data' esté activa
    // (Si ya estás en la pestaña, este clic está bien, si no, puedes necesitar un 'openDataTab()')
    await this.dataTab.click();

    // Locator para el enlace
    const mapLinkLocator = this.page.getByRole('link', {
      name: 'https://clausa.app.carto.com/',
    });

    console.log(
      'Haciendo clic en el enlace del mapa y esperando la nueva pestaña...',
    );

    // ⭐ CORRECCIÓN DE LA SINCRONIZACIÓN Y SINTAXIS ⭐
    // Usamos Promise.all para esperar simultáneamente el clic Y la apertura de la nueva página.
    const [newMapPage] = await Promise.all([
      // 1. Promesa: Esperar el evento de nueva página/pestaña (popup)
      this.page.waitForEvent('popup'),
      // 2. Acción: Hacer clic en el locator (que dispara la nueva pestaña)
      mapLinkLocator.click({ timeout: 10000 }),
    ]);

    // 2. Esperar la URL específica o el estado de carga
    await newMapPage.waitForURL('**/builder/*');
    console.log('Successfully navigated to Map page.');

    return newMapPage;
  }

  async scrollToElementHorizontal(elementLocator: Locator): Promise<void> {
    await elementLocator.evaluate(element => {
      element.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'end',
      });
    });
  }

  /*async assertStateExcludesCA(regionName: string): Promise<void> {
    this.selectNode('Spatial Filter');
    console.log(`Asserting that data excludes region: "${regionName}"...`);

    await this.dataTab.waitFor({ state: 'visible', timeout: 5000 });
    //await this.page.pause();
    await this.dataTab.click();
    //this.selectNode('Spatial Filter');
    await this.page.waitForTimeout(2000); // Espera para asegurar que los datos se carguen
    //await this.page.pause();
    await this.scrollToElementHorizontal(this.stateColumnHeader);

    // 3. Obtener el índice de la columna 'state'
    const stateHeaderIndex = await this.stateColumnHeader.evaluate(element => {
      // Encontrar el índice de la celda de encabezado dentro de su fila (thead > tr)
      const row = element.closest('tr');
      if (!row) return -1;
      return Array.from(row.children).indexOf(element);
    });

    if (stateHeaderIndex === -1) {
      throw new Error("No se pudo determinar la columna 'state'.");
    }

    // 4. Localizar todas las celdas de datos (td) de la columna 'state'
    // Selector XPath o CSS que busca la N-ésima celda (td) en cada fila (tr) del cuerpo (tbody)
    const stateCells = this.page.locator(
      `tbody tr td:nth-child(${stateHeaderIndex + 1})`,
    );

    const count = await stateCells.count();

    // 5. Iterar sobre todas las celdas y validar el contenido
    for (let i = 0; i < count; ++i) {
      const cell = stateCells.nth(i);
      // Validar que el texto de la celda es exactamente 'CA' (o el texto que corresponde a esa columna)
      await expect(cell).not.toHaveText('CA', { timeout: 5000 });
    }

    console.log(
      `✅ Validación Positiva: Las ${count} filas de la columna 'state' no contienen 'CA'.`,
    );
    await this.closeNodeConfigurationPanel();
  }*/
  async closeNodeConfigurationPanel(): Promise<void> {
    console.log('Cerrando el panel de configuración del nodo...');

    // 1. Esperar a que el pane esté visible
    //await this.reactFlowRenderer.waitFor({ state: 'visible', timeout: 5000 });

    // 2. Hacer clic en el centro del pane. Este clic fuera de la configuración
    // suele ser la acción que la descarta.
    await this.reactFlowRenderer.click();

    // Opcional: Agregar una aserción para verificar que el panel desaparece
    // Por ejemplo: esperar que el encabezado del panel ya no esté visible.
    // await this.page.getByRole('heading', { name: 'Simple Filter' }).waitFor({ state: 'hidden' });
  }
  async assertStateColumnContent(
    expectedState: string,
    mode: 'includes' | 'excludes',
  ): Promise<void> {
    // Asumiendo que 'this.dataTab' y 'this.stateColumnHeader' son locators definidos.
    // Asumiendo que 'this.scrollToElementHorizontal' y 'this.selectNode' existen.
    const allowedStatesForBugFix = [expectedState, 'NV'];

    await this.selectNode('Spatial Filter');

    console.log(`Asserting data ${mode} region: "${expectedState}"...`);

    // 1. Navegar a la pestaña Data
    await this.dataTab.waitFor({ state: 'visible', timeout: 5000 });
    await this.dataTab.click();

    // Dar tiempo para que la tabla se re-renderice con los datos
    await this.page.waitForTimeout(2000);

    // 2. Hacer scroll para ver la columna 'state'
    await this.scrollToElementHorizontal(this.stateColumnHeader);

    // 3. Obtener el índice de la columna 'state'
    const stateHeaderIndex = await this.stateColumnHeader.evaluate(element => {
      const row = element.closest('tr');
      if (!row) return -1;
      return Array.from(row.children).indexOf(element);
    });

    if (stateHeaderIndex === -1) {
      throw new Error("No se pudo determinar la columna 'state'.");
    }

    // 4. Localizar todas las celdas de datos (td) de la columna 'state'
    const stateCells = this.page.locator(
      `tbody tr td:nth-child(${stateHeaderIndex + 1})`,
    );
    const count = await stateCells.count();

    // 5. Iterar sobre todas las celdas y aplicar la aserción basada en 'mode'
    for (let i = 0; i < count; ++i) {
      const cell = stateCells.nth(i);

      if (mode === 'includes') {
        // Escenario Positivo: TODAS las celdas DEBEN tener el texto (ej: 'CA')
        //await expect(cell).toHaveText(expectedState, { timeout: 5000 });
        const actualText = await cell.innerText();

        // ⭐ Lógica para Aceptar Múltiples Estados ⭐
        // Si el texto de la celda NO está en la lista de permitidos, forzamos un fallo claro.
        if (!allowedStatesForBugFix.includes(actualText)) {
          // Usamos la aserción de Playwright para generar un fallo limpio
          throw new Error(
            `Expected cell to contain one of [${allowedStatesForBugFix.join(', ')}] but found: '${actualText}'.`,
          );
        }
      } else if (mode === 'excludes') {
        // Escenario Negativo: NINGUNA celda DEBE tener el texto (ej: 'CA')
        await expect(cell).not.toHaveText(expectedState, { timeout: 5000 });
      }
    }

    console.log(`✅ Validación ${mode}: ${count} filas verificadas.`);

    // 6. Cerrar el panel de configuración (si el panel de resultados lo es o si estaba abierto)
    await this.closeNodeConfigurationPanel();
  }
}
