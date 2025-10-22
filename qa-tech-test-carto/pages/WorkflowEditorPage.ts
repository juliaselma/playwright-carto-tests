import { Page, expect } from '@playwright/test';

interface EvaluateArgs {
    name: string;
    selector: string;
}

export class WorkflowEditorPage {
  private readonly connectionDataButton = this.page.getByText('Connection data');
  private readonly demoDataButton = 'p:has-text("demo data")';
  private readonly demoTablesButton = this.page.getByText('demo_tables');
  //private readonly scrollContainerSelector = 'div.infinite-scroll-component';
  private readonly scrollContainerSelector = 'div.css-175htjn'; // Updated selector for the scrollable container
  private readonly listItemSelector = 'li[data-testid="data-explorer-list-item"]';
  private readonly firstDatasetItem = this.page.getByText('blue_whales_eastern_pacific_line');
  private readonly scrollDownButtonSelector = 'button.css-mracrb';
  private readonly retailStoresSetItem = this.page.getByText('retail_stores');
  private readonly backButton = this.page.getByRole('button', { name: 'Back' });

  private readonly datasetListSelector = 'li[data-testid="data-explorer-list-item"]'
  private readonly runWorkflowButton = 'button[aria-label="Run workflow"]';
  private readonly nodePanel = '#left-panel-nodes';
  private readonly canvas = '#workflow-editor-canvas';
  private readonly settingsPanel = '#right-panel-settings';

  

  constructor(public readonly page: Page) {}

  async selectDataset(datasetName: string) {

    await this.connectionDataButton.waitFor({ state: 'visible', timeout: 30000 });
    const responsePromise = this.page.waitForResponse(
        response => response.url().includes('/v3/sql/') && response.status() === 200,
        { timeout: 30000 }
    );
    await this.connectionDataButton.click();
    await this.page.click(this.demoDataButton);
    await this.demoTablesButton.click();
    await responsePromise;

    const scrollContainer = this.page.locator(this.scrollContainerSelector);
    await scrollContainer.waitFor({ state: 'visible', timeout: 15000 }); 

    // Definición del localizador del dataset que buscamos (para el clic final)
    const datasetItem = this.page.locator('li[data-testid="data-explorer-list-item"]').filter({
        hasText: datasetName 
    });

    const argsToPass: EvaluateArgs = {
        name: datasetName,
        selector: this.listItemSelector
    };

    // 2. FORZAR SCROLL CON JAVASCRIPT
    // La función inyectada ahora solo tiene DOS parámetros: container y args
    const found = await scrollContainer.evaluate(async (container: HTMLElement, args: EvaluateArgs) => {
        
        function findItemByText(root: HTMLElement, text: string, selector: string): HTMLLIElement | null {
            // El selector se pasa a la función interna
            const normalizedTarget = text.toLowerCase().trim(); 
            const listItems = root.querySelectorAll(selector);
            
            for (const item of Array.from(listItems)) {
                if (item.textContent?.toLowerCase().trim().includes(normalizedTarget)) {
                    return item as HTMLLIElement;
                }
            }
            return null;
        }

        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const MAX_SCROLLS = 50; 
        const SCROLL_DELAY = 200; 
        
        for (let i = 0; i < MAX_SCROLLS; i++) {
            
            // Usamos las propiedades del objeto args
            const itemToFind = findItemByText(container, args.name, args.selector); 
            
            if (itemToFind) {
                itemToFind.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return true; 
            }

            container.scrollTop = container.scrollHeight; 
            container.dispatchEvent(new Event('scroll'));
            
            await sleep(SCROLL_DELAY); 
        }
        return false;
        
    }, argsToPass); // ⭐ PASAR EL OBJETO COMBINADO ⭐

    // 3. CLIC FINAL
    if (!found) {
        throw new Error(`El dataset "${datasetName}" no se encontró después de intentar el scroll (Lazy Loading Fallido).`);
    }

    await datasetItem.waitFor({ state: 'visible' });
    await datasetItem.click();
  }





  /** Conecta dos nodos usando sus nombres */
  async connectNodes(sourceNodeName: string, targetNodeName: string) {
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
  }
}