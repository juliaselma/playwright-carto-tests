import { Page, Locator } from '@playwright/test';

interface EvaluateArgs {
  name: string;
  selector: string;
}

//Node dimensions and spacing for layout calculations
const NODE_HEIGHT = 50;
const VERTICAL_SPACING = 30;

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
  private readonly runWorkflowButton = 'button[aria-label="Run workflow"]';
  private readonly nodePanel = '#left-panel-nodes';
  private readonly canvas = 'div.react-flow__renderer';
  private readonly settingsPanel = '#right-panel-settings';

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
          `Error obtaining position for node "${datasetName}"`,
        );
      }
    }

    //drag and drop the dataset onto the canvas at calculated position
    await this.dragDatasetToCanvas(datasetItem, datasetName, {
      x: targetX,
      y: targetY,
    });

    //Post-drag wait to ensure node is fully loaded
    await this.waitForNodeToLoad(datasetName);
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

  async waitForNodeToLoad(nodeName: string): Promise<void> {
    await this.page.waitForTimeout(8000);
  }

  //__________________
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
      console.warn(
        'Delete map was not completed.',
        error,
      );
    }
  }

  /** Conecta dos nodos usando sus nombres */
  /*async connectNodes(sourceNodeName: string, targetNodeName: string) {
    // Este es un paso complejo en automatización, a menudo requiere coordinadas de canvas o botones de conexión.
    // Para simplificar el setup inicial, nos enfocaremos en la conexión por los puertos de entrada/salida.
    
    // EJEMPLO SIMPLIFICADO: Hacer clic en el puerto de salida del primer nodo y luego en el puerto de entrada del segundo nodo
    const sourceNodeOutputPort = this.page.locator(`[data-node-title="${sourceNodeName}"] .port-out`).first();
    const targetNodeInputPort = this.page.locator(`[data-node-title="${targetNodeName}"] .port-in`).first();
    
    await sourceNodeOutputPort.click();
    await targetNodeInputPort.click();
    
    // Verificación de la conexión
    // await expect(this.page.locator('svg.edge')).toBeVisible(); // Opción más robusta
  }

  async runWorkflow() {
    await this.page.click(this.runWorkflowButton);
    // Esperar a que el estado cambie a "Success"
    const successIndicator = this.page.locator('.workflow-status-indicator[title="Success"]');
    await expect(successIndicator).toBeVisible({ timeout: 60000 }); // Espera hasta 60 segundos
  }

  async openMap() {
    // Abre el mapa después de la ejecución exitosa
    await this.page.locator('.node-title', { hasText: 'Create Builder Map' }).click();
    await this.page.getByRole('button', { name: 'Open Map' }).click();
    
    // Esperar que la nueva pestaña se abra
    const mapPagePromise = this.page.context().waitForEvent('page');
    const mapPage = await mapPagePromise;
    await mapPage.waitForLoadState();
    
    return mapPage;
  }*/
}
