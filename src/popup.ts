import { ExtensionSettings, StorageResult } from "./interfaces/settings";

/**
 * Controller class for the extension's popup interface
 * Manages the UI elements and their interactions with Chrome's storage
 */
class PopupController {
  private enabledCheckbox!: HTMLInputElement;
  private shiftEnterCheckbox!: HTMLInputElement;

  /**
   * Initializes the popup controller by setting up UI elements and loading settings
   */
  constructor() {
    this.initElements();
    this.init();
  }

  /**
   * Initializes UI elements by getting references to the checkboxes
   * @throws {Error} If required elements are not found in the DOM
   * @private
   */
  private initElements(): void {
    const enabledEl = document.getElementById("enabled");
    const shiftEnterEl = document.getElementById("useShiftEnter");

    if (!enabledEl || !shiftEnterEl) {
      throw new Error("Required elements not found");
    }

    this.enabledCheckbox = enabledEl as HTMLInputElement;
    this.shiftEnterCheckbox = shiftEnterEl as HTMLInputElement;
  }

  /**
   * Initializes the popup by loading settings and setting up event listeners
   * @private
   */
  private async init(): Promise<void> {
    try {
      await this.loadSettings();
      this.setupListeners();
    } catch (error) {
      console.error("Failed to initialize popup:", error);
    }
  }

  /**
   * Loads extension settings from Chrome's storage and updates UI elements
   * @private
   */
  private async loadSettings(): Promise<void> {
    try {
      const result = (await chrome.storage.sync.get([
        "enabled",
        "useShiftEnter",
      ])) as StorageResult;
      this.enabledCheckbox.checked = result.enabled !== false;
      this.shiftEnterCheckbox.checked = result.useShiftEnter || false;
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  /**
   * Sets up event listeners for checkbox changes
   * Updates Chrome's storage when settings are changed
   * @private
   */
  private setupListeners(): void {
    this.enabledCheckbox.addEventListener("change", async () => {
      try {
        await chrome.storage.sync.set({
          enabled: this.enabledCheckbox.checked,
        });
        console.log("Enabled setting updated:", this.enabledCheckbox.checked);
      } catch (error) {
        console.error("Failed to save enabled setting:", error);
      }
    });

    this.shiftEnterCheckbox.addEventListener("change", async () => {
      try {
        await chrome.storage.sync.set({
          useShiftEnter: this.shiftEnterCheckbox.checked,
        });
        console.log(
          "Shift+Enter setting updated:",
          this.shiftEnterCheckbox.checked
        );
      } catch (error) {
        console.error("Failed to save shift+enter setting:", error);
      }
    });
  }
}

// Initialize when the DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new PopupController());
} else {
  new PopupController();
}
