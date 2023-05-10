/* eslint-disable no-console */
import buildConfig from '../buildConfig';
import { FaderSceneDataType, FaderStoryDataType } from '../types/FaderTypes';
import { defaultProjectData, defaultSceneData } from './defaults';

const devMode = buildConfig.dev.devMode;

type FaderNestedObjectKeysAreEqualParams = {
    object1: unknown;
    object2: unknown;
    opts?: { excludeObjKeys?: string[]; recursive?: boolean };
};
export const faderNestedObjectKeysAreEqual = ({ object1, object2, opts }: FaderNestedObjectKeysAreEqualParams) => {
    const excludeObjKeys = (opts && opts.excludeObjKeys) || undefined;
    const recursive = (opts && opts.recursive) || false;

    // const isEqualArray: boolean[] = [];

    const isEqualCollection: { objectKey: string; isEqual: boolean }[] = [];

    if (isObject(object1 as object) && isObject(object2 as object)) {
        const typedObject1 = object1 as Record<string, unknown>;
        const typedObject2 = object2 as Record<string, unknown>;

        const object1Keys = Object.keys(typedObject1).sort();
        const object2Keys = Object.keys(typedObject2).sort();

        if (object1Keys.length == 0) {
            if (object2Keys.length > 0) {
                return recursive
                    ? [{ objectKey: `No Key: ${object1Keys.length}, ${object2Keys.length} (Obj1Keys, Obj2Keys length)`, isEqual: false }]
                    : false;
            }
        }

        /* First check: Same length */
        if (object1Keys.length == object2Keys.length) {
            for (let i = 0; i < object1Keys.length; i++) {
                const object1Property = typedObject1[object1Keys[i]];
                const object2Property = typedObject2[object2Keys[i]];

                /* Second check: Key names are not the same */
                if (object1Keys[i] !== object2Keys[i]) {
                    isEqualCollection.push({ objectKey: object1Keys[i], isEqual: false });
                    break;
                }

                /* If nested objects, recursively traverse these */
                if (
                    isObject(object1Property as object) &&
                    isObject(object2Property as object) &&
                    !excludeObjKeys?.includes(object1Keys[i])
                ) {
                    const nestedIsEqualCollectionArray = faderNestedObjectKeysAreEqual({
                        object1: object1Property,
                        object2: object2Property,
                        opts: { ...opts, recursive: true },
                    }) as typeof isEqualCollection;

                    isEqualCollection.push(...nestedIsEqualCollectionArray);
                }
            }
        } else {
            isEqualCollection.push({
                objectKey: `Length differs -> object1Keys.length == object2Keys.length: ${
                    object1Keys.length == object2Keys.length
                }, "${JSON.parse(JSON.stringify(object1Keys))}" (obj1Keys), "${JSON.parse(JSON.stringify(object2Keys))}" (obj2Keys)`,
                isEqual: false,
            });
        }

        const falseResultInCollection = isEqualCollection.map((collectionEntry) => {
            if (collectionEntry.isEqual == false) {
                return collectionEntry;
            }
        });
        if (recursive) {
            return isEqualCollection;
        } else if (falseResultInCollection.length) {
            devMode && console.log(`${falseResultInCollection[0]?.objectKey}, ${falseResultInCollection[0]?.isEqual}`);
            return false;
        } else {
            return true;
        }
    } else {
        devMode && console.log(`faderNestedObjectKeysAreEqual: One or both variables to compare are not Objects!`, object1, object2);
        return false;
    }
};

export const isObject = (object: object) => {
    if (typeof object === 'object' && !Array.isArray(object) && object !== null) {
        return true;
    } else {
        return false;
    }
};

export const syncProjectData = (remoteProjectData: FaderStoryDataType) => {
    /* Always up-to-date "Point of truth": */
    const newProjectData = createProjectData();

    /* Get rid of old keys in remote project that are no longer used: */
    for (const key in remoteProjectData) {
        if (!(key in newProjectData)) {
            delete remoteProjectData[key as keyof FaderStoryDataType];
        }
    }

    /* Create key/values from point of truth, overwrite default values with any existing in remote Data: */
    const synchronizedProjectData = {
        ...newProjectData,
        ...remoteProjectData,
        ui: {
            ...newProjectData.ui,
            ...remoteProjectData.ui,
        },
    };

    return synchronizedProjectData;
};

export const syncSceneData = (remoteSceneData: FaderSceneDataType) => {
    /* Always up-to-date "Point of truth": */
    const newSceneData = createSceneData();

    /* Get rid of old keys in remote project that are no longer used: */
    for (const key in remoteSceneData) {
        if (!(key in newSceneData)) {
            delete remoteSceneData[key as keyof FaderSceneDataType];
        }
    }

    /* Sometimes we rename keys: */
    if (remoteSceneData.assetOrderByGroup && 'Interactive' in remoteSceneData.assetOrderByGroup) {
        const interactiveBackup = remoteSceneData.assetOrderByGroup.Interactive as string[];
        delete remoteSceneData.assetOrderByGroup.Interactive;
        remoteSceneData.assetOrderByGroup.SceneLink.push(...interactiveBackup);
    }

    /* Create key/values from point of truth, overwrite default values with any existing in remote Data: */
    const synchronizedSceneData = {
        ...newSceneData,
        ...remoteSceneData,
        assetOrderByGroup: {
            ...newSceneData.assetOrderByGroup,
            ...remoteSceneData.assetOrderByGroup,
        },
        environment: {
            ...newSceneData.environment,
            ...remoteSceneData.environment,
        },
        ui: {
            ...newSceneData.ui,
            ...remoteSceneData.ui,
        },
    };

    console.log('%c[createData]', 'color: #f62612', `synchronizedSceneData :`, synchronizedSceneData);
    return synchronizedSceneData;
};

export const createProjectData = () => {
    return { ...defaultProjectData };
};

export const createSceneData = () => {
    return { ...defaultSceneData };
};

export const removeDuplicatesInArray = (array: unknown[]) => {
    return [...new Set(array)];
};
