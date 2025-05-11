/**
 * Interface representing the extension's configuration settings
 * @interface ExtensionSettings
 */
export interface ExtensionSettings {
  /** Whether the extension is enabled */
  enabled: boolean;
  /** Whether Shift+Enter is required for message submission */
  useShiftEnter: boolean;
}

/**
 * Interface representing the storage result from Chrome's storage API
 * All properties are optional as they may not exist in storage
 * @interface StorageResult
 */
export interface StorageResult {
  /** Whether the extension is enabled */
  enabled?: boolean;
  /** Whether Shift+Enter is required for message submission */
  useShiftEnter?: boolean;
}
