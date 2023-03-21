/* Helper Type that removes the "| undefined" part from types */
export type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };
