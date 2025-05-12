import { ExtensionSettings, StorageResult } from "./interfaces/settings";

/**
 * Main class that handles Japanese input behavior in Claude's interface
 * Manages IME composition and Enter key behavior for textareas
 */
class ClaudeInputHelper {
  private isEnabled: boolean = true;
  private useShiftEnter: boolean = false;
  private isComposing: boolean = false;

  /**
   * CSS selectors for different types of textareas in Claude's interface
   * @private
   */
  private readonly SELECTORS = {
    // Textarea used when editing messages
    editingTextarea: 'textarea[data-1p-ignore="true"]',
    // Generic textarea within forms
    formTextarea: "form textarea",
    // Textarea within forms that have a save button
    editFormTextarea:
      'form:has(button[type="submit"]:has-text("保存")) textarea',
  };

  /**
   * Initializes the helper by loading settings and setting up event listeners
   */
  constructor() {
    this.init();
  }

  /**
   * Initializes the helper by loading settings and setting up event listeners
   * @private
   */
  private async init(): Promise<void> {
    try {
      await this.loadSettings();
      this.setupListeners();
      console.log("Claude Input Helper initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Claude Input Helper:", error);
    }
  }

  /**
   * Loads extension settings from Chrome's storage
   * @private
   */
  private async loadSettings(): Promise<void> {
    try {
      const result = (await chrome.storage.sync.get([
        "enabled",
        "useShiftEnter",
      ])) as StorageResult;
      this.isEnabled = result.enabled !== false;
      this.useShiftEnter = result.useShiftEnter || false;
      console.log("Settings loaded:", {
        enabled: this.isEnabled,
        useShiftEnter: this.useShiftEnter,
      });
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  /**
   * Sets up event listeners for storage changes, IME composition, and keyboard events
   * @private
   */
  private setupListeners(): void {
    // Monitor settings changes
    chrome.storage.onChanged.addListener(this.handleStorageChange.bind(this));

    // Track IME composition state
    document.addEventListener("compositionstart", (e) => {
      const target = e.target as HTMLElement;
      if (this.isEditingTextarea(target)) {
        this.isComposing = true;
        console.log("IME composition started on editing textarea");
      }
    });

    document.addEventListener("compositionend", (e) => {
      const target = e.target as HTMLElement;
      if (this.isEditingTextarea(target)) {
        this.isComposing = false;
        console.log("IME composition ended on editing textarea");
      }
    });

    // Monitor Enter key events (in capture phase)
    document.addEventListener("keydown", this.handleKeyDown.bind(this), true);
  }

  /**
   * Handles changes to extension settings in Chrome's storage
   * @param changes - Object containing the changes made to storage
   * @private
   */
  private handleStorageChange(changes: {
    [key: string]: chrome.storage.StorageChange;
  }): void {
    if (changes.enabled) {
      this.isEnabled = changes.enabled.newValue;
      console.log("Extension enabled state changed:", this.isEnabled);
    }
    if (changes.useShiftEnter) {
      this.useShiftEnter = changes.useShiftEnter.newValue;
      console.log("Shift+Enter option changed:", this.useShiftEnter);
    }
  }

  /**
   * Checks if an element is a textarea that should be handled by the extension
   * @param element - The HTML element to check
   * @returns boolean indicating if the element is a target textarea
   * @private
   */
  private isEditingTextarea(element: HTMLElement): boolean {
    // Check if element is a textarea
    if (element.tagName.toLowerCase() !== "textarea") {
      return false;
    }

    // Check against defined selectors
    for (const selector of Object.values(this.SELECTORS)) {
      if (element.matches(selector)) {
        return true;
      }
    }

    // Check if in a form with a save button
    const form = element.closest("form");
    if (form && form.querySelector('button[type="submit"]')) {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton?.textContent?.includes("保存")) {
        return true;
      }
    }

    return false;
  }

  /**
   * Handles keyboard events, specifically Enter key behavior
   * Manages different Enter key behaviors based on settings and IME state
   * @param e - The keyboard event
   * @private
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.isEnabled) return;

    const target = e.target as HTMLElement;

    // Check if target is an editing textarea
    if (!this.isEditingTextarea(target)) return;

    if (e.key === "Enter") {
      const logDetails = {
        shiftKey: e.shiftKey,
        isComposing: this.isComposing,
        useShiftEnter: this.useShiftEnter,
        targetTag: target.tagName,
        targetId: target.id,
        targetClasses: target.className,
      };

      console.log("Enter key pressed in editing textarea:", logDetails);

      // Allow submission if Shift+Enter is enabled and Shift is pressed
      if (this.useShiftEnter && e.shiftKey) {
        console.log("Shift+Enter detected - submitting");
        // フォームを探して送信
        const form = target.closest("form");
        if (form) {
          e.preventDefault();
          e.stopPropagation();
          form.requestSubmit();
        }
        return;
      }

      // Allow new line if Shift+Enter is disabled and Shift is pressed
      if (!this.useShiftEnter && e.shiftKey) {
        console.log("Shift+Enter for new line - allowing default behavior");
        return;
      }

      // Prevent Enter during IME composition
      if (this.isComposing) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log("Enter key prevented during IME composition");
        return;
      }

      // Prevent submission if Shift+Enter is required but Shift is not pressed
      if (this.useShiftEnter && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        // 改行を挿入
        const textarea = target as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        textarea.value =
          value.substring(0, start) + "\n" + value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;

        // auto adjust height
        const inputEvent = new InputEvent("input", {
          bubbles: true,
          cancelable: true,
          inputType: "insertLineBreak",
          data: "\n",
        });
        textarea.dispatchEvent(inputEvent);

        console.log("Enter without Shift - inserted newline");
        return;
      }

      // Allow default submission behavior for regular Enter
      console.log("Regular Enter - allowing submission");
    }
  }
}

// Initialize when the page is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new ClaudeInputHelper());
} else {
  new ClaudeInputHelper();
}
