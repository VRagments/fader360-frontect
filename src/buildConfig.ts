/* eslint-disable @typescript-eslint/no-var-requires */

let config: Partial<ConfigType> = {};

type ConfigType = {
    api: {
        baseUrl: string;
    };
    dev: {
        devMode: boolean;
        debugURLenabled: boolean;
    };
};

if (process.env.NODE_ENV === 'production') {
    config = require('./prodConfig.json') as ConfigType;
} else {
    config = require('./devConfig.json') as ConfigType;
}

export default {
    ...(config as ConfigType),
};
