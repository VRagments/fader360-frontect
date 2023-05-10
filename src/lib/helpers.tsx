/** Checks whether a `string` input adheres to common `UUID` format, see https://stackoverflow.com/a/55138317 */
export function isUUID(uuid: string) {
    let s: string | RegExpMatchArray | null = '' + uuid;

    s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    if (s === null) {
        return false;
    }
    return true;
}

export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
