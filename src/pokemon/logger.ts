type Logger = (message: any) => void;

let logger: Logger | null = null;

export function setLogger(to: Logger) {
  logger = to;
}

export function log(message: any) {
  logger?.(message);
}
