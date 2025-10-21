import { Page, expect } from '@playwright/test';

export class WorkflowEditorPage {
  // Selectores para el editor
  private readonly createWorkflowButton = 'button:has-text("Create workflow")';
  private readonly runWorkflowButton = 'button[aria-label="Run workflow"]';
  private readonly nodePanel = '#left-panel-nodes';
  private readonly canvas = '#workflow-editor-canvas';
  private readonly settingsPanel = '#right-panel-settings';

  constructor(public readonly page: Page) {}

  async createNewWorkflow() {
    //await this.page.click(this.createWorkflowButton);
    await this.page.getByRole('link', { name: 'Workflow' }).click();
    await this.page.getByRole('menuitem', { name: 'Workflows' }).click();
    await this.page.waitForURL('**/workflows/**');
  }

  /** Añade un nodo al canvas arrastrándolo desde el panel izquierdo */
  async addNodeToCanvas(nodeName: string) {
    const nodeItem = this.page.locator(this.nodePanel).getByRole('button', { name: nodeName });
    await nodeItem.scrollIntoViewIfNeeded();

    // Arrastrar el nodo desde el panel al centro del canvas
    await nodeItem.dragTo(this.page.locator(this.canvas), {
      sourcePosition: { x: 50, y: 10 },
      targetPosition: { x: 400, y: 250 },
    });
    // Verificar que el nodo aparece en el canvas
    await expect(this.page.locator('.node-title', { hasText: nodeName })).toBeVisible();
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