/* eslint-disable no-console */
import { cloneDeep } from 'lodash';



type DevConsoleOptions = {
    method: 'log' | 'warn' | 'error';
    printStack?: boolean;
    clone?: boolean; // clone the argument (to create a snapshot at time of execution) ?
    devMode?: boolean; // boolean value to use instead of NODE_ENV
};

const isOptsObject = (arg: unknown) =>
    Object.keys(arg as Record<string, unknown>).some((key) => key == 'printStack' || key == 'clone' || key == 'devMode');

/** First argument can be an options object with keys 'printStack', 'clone', 'devMode' */
const DevConsole = {
    log: (...args: unknown[]) => consoleFn(args[0] && isOptsObject(args[0]) ? { ...args[0], method: 'log' } : { method: 'log' }, ...args),
    warn: (...args: unknown[]) =>
        consoleFn(args[0] && isOptsObject(args[0]) ? { ...args[0], method: 'warn' } : { method: 'warn' }, ...args),
    error: (...args: unknown[]) =>
        consoleFn(args[0] && isOptsObject(args[0]) ? { ...args[0], method: 'error' } : { method: 'error' }, ...args),
};

export default DevConsole;

function consoleFn(opts: DevConsoleOptions, ...args: unknown[]) {
    const { method, printStack, clone, devMode } = opts;

    /* run only in dev mode */
    const isDev = devMode ? devMode : process.env.NODE_ENV !== 'production';

    if (isDev) {
        const cloneArg = clone ? clone : true;

        if (args) {
            const errorStack = new Error().stack;
            const callerFunction = getCallerFromErrorStack(errorStack);
            let optsString = '\n';

            if (args[0] && isOptsObject(args[0])) {
                /* remove the opts object from args: */
                args.splice(0, 1);

                if (printStack !== undefined) {
                    optsString += '\n' + `"printStack": ${printStack}`;
                }
                if (clone !== undefined) {
                    optsString += '\n' + `"clone": ${clone}`;
                }
                if (devMode !== undefined) {
                    optsString += '\n' + `"devMode": ${devMode}`;
                }
            }

            const consoleArgs = args.map((arg) => {
                if (typeof arg === 'string') {
                    return arg;
                } else if (cloneArg) {
                    return cloneDeep(arg);
                } else {
                    return arg;
                }
            });

            consoleArgs.unshift(`DC:%c[${callerFunction}]`, `color: ${randomHexColor(callerFunction)};`);

            console[method](...consoleArgs, optsString);

            if (printStack) {
                console[method](...consoleArgs, optsString, '\n\n', 'DevConsole.printStack: ', new Error('').stack);
            }
        }
    }
}

function getCallerFromErrorStack(errorStack: Error['stack']) {
    if (!errorStack) {
        return 'Undefined';
    }

    const splitErrorStack = errorStack.split('\n');
    let errorStackStartIndex = 3;

    const getCaller = (errorStackStartIndex: number, splitErrorStack: string[]) => {
        const a = errorStack && splitErrorStack[errorStackStartIndex]; // 0 = empty line, 1 = consoleFn, 2 = Object.log, so ...
        const b = a && a.trim(); // trim whitespaces beginning/end
        const bSplit = b.split(' '); // split at empty spaces

        let c: string;
        if (b.includes('async')) {
            c = b && bSplit[2];
        } else {
            c = b && bSplit[1];
        }
        const d = c && c.match(/\w+/)![0];

        return d;
    };

    const initialAttempt = getCaller(errorStackStartIndex, splitErrorStack);

    if (initialAttempt && initialAttempt !== 'http') {
        return initialAttempt;
    } else {
        errorStackStartIndex += 1;
        return getCaller(errorStackStartIndex, splitErrorStack);
    }
}

// Check out https://stackoverflow.com/a/36152335 or:
// const calleeFunction = errorStack?.split('\n')[1].trim().split(' ')[1];


/**
 *
 * Helper functions:
 *
 */

/** Returns a random `#FFFFFF` hex color code if no arguments, or generates a hex code from passed in number/string */
const randomHexColor = (num?: string | number) => {
    if (num) {
        let sum = 0;
        let numString: string;

        if (typeof num == 'number') {
            numString = num.toString();
        } else {
            numString = num;
        }

        for (let i = 0; i < numString.length; i++) {
            sum += numString.charCodeAt(i);
        }

        /* This is kinda arbitrary */
        sum = sum / (numString.length * 1000);

        /* The number 16,777,215 is the total possible combinations of RGB(255,255,255) which is 32 bit colour. */
        const hexSum = `#${Math.floor(sum * 16777215).toString(16)}`;

        return hexSum;
    } else {
        return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }
};
