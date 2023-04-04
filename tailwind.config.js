/**
 * In LeveOptions.tsx, we're looking up tailwind css styles directly.
 * Since files outside of /src can not be referenced in CRA, the original config file for tailwind is moved to /src and imported from here to prevent follow-on errors
 * See: https://stackoverflow.com/a/73092228
 */

const tailwindConfig = require('./src/tailwind.config');

module.exports = tailwindConfig;
