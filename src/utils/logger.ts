/**
 * ロガーユーティリティ
 * 開発環境でのみログを出力する
 */
const isDevelopment = import.meta.env.MODE !== "production";

export const logger = {
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args: unknown[]): void => {
    // エラーログは常に出力
    console.error(...args);
  },
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
};

