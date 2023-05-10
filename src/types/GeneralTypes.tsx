import { NavigateOptions, URLSearchParamsInit } from 'react-router-dom';

/* Helper Type that removes the "| undefined" part from types */
export type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };

/* Copied from https://reactrouter.com/en/main/hooks/use-search-params because https://github.com/remix-run/react-router/issues/10212 */
export type SetURLSearchParams = (
    nextInit?: URLSearchParamsInit | ((prev: URLSearchParams) => URLSearchParamsInit),
    navigateOpts?: NavigateOptions
) => void;
