export class Logger {
  public static info(...args: any[]): void;
  public static success(...args: any[]): void;
  public static error(...args: any[]): void;
  public static fatal(...args: any[]): void;
  
  /**
   * Writes a blank line
   */
  public static blank(): void;
}