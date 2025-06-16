const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
type LogLevel = typeof LOG_LEVELS[number];

let currentLevel = import.meta.env.VITE_LOG_LEVEL || 'info';

export function setLogLevel(level: LogLevel) {
    currentLevel = level;
}

export function log(message: string, level: LogLevel = 'info', ...args: any[]) {
    if (LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(currentLevel)) {
        console[level](`[LOG] ${message}`, ...args);
    }
}