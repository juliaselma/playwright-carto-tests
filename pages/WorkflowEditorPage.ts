import { Page, Locator } from '@playwright/test';

interface EvaluateArgs {
  name: string;
  selector: string;
}

export class WorkflowEditorPage {
  private readonly workflowCanvas: Locator;
  private readonly connectionDataButton =
    this.page.getByText('Connection data');
  private readonly demoDataButton = 'p:has-text("demo data")';
  private readonly demoTablesButton = this.page.getByText('demo_tables');
  private readonly scrollContainerSelector = 'div.css-175htjn'; // Updated selector for the scrollable container
  private readonly listItemSelector =
    'li[data-testid="data-explorer-list-item"]';
  private readonly canvasSelector = 'div[aria-label="workflow-canvas"]';
  private readonly workflowActionsMenuButton = this.page.getByRole('button', {
    name: 'workflow-actions-menu',
  });
  //private readonly nodeBoxSelector = 'div[data-testid="WorkflowSourceNodeBox"]';
  private getWorkflowNodeLocator(nodeName: string): Locator {
    // Retorna un Locator que filtra por el nombre pasado como argumento
    return this.page.locator('.react-flow__node').filter({
      hasText: nodeName,
    });
  }

  private readonly homeButton = 'a[data-testid="linkLogo"]';

  // La opción 'Delete' que aparece en el menú desplegable
  private readonly deleteOptionInMenu = this.page.getByRole('menuitem', {
    name: 'Delete',
  });

  // El botón de confirmación en la ventana modal
  private readonly deleteConfirmationButton = this.page.getByRole('button', {
    name: 'Yes, delete',
  });

  private readonly runWorkflowButton = 'button[aria-label="Run workflow"]';
  private readonly nodePanel = '#left-panel-nodes';
  private readonly canvas = 'div.react-flow__renderer'; // Selector for the workflow editor canvas
  private readonly settingsPanel = '#right-panel-settings';

  constructor(public readonly page: Page) {
    this.workflowCanvas = page.locator(this.canvasSelector);
  }

  async selectFirstDataset(datasetName: string) {
    await this.openDemoTablesPanel();
    const datasetItem = await this.findDatasetItem(datasetName);
    await this.dragDatasetToCanvas(datasetItem);
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

  async dragDatasetToCanvas(datasetItem: Locator): Promise<void> {
    await this.workflowCanvas.waitFor({ state: 'visible' });

    await datasetItem.dragTo(this.workflowCanvas, {
      targetPosition: { x: 100, y: 100 },
      timeout: 15000,
    });
    await this.page.waitForTimeout(8000);
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
        'No se pudo completar la limpieza (deleteMap). Esto puede indicar que no había un mapa que borrar, o que el selector de la modal ha cambiado:',
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
