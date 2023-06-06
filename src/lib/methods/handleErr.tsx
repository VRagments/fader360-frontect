import DevConsole from './DevConsole';

/**
 * @throws {err}
 */
export function handleErr(...args: unknown[]): never {
    DevConsole.error(`ErrorHandler: `, ...args);
    throw args;
}
