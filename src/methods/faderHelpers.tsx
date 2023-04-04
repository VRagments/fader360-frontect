import { FaderAssetGroupType, FaderAssetType, FaderBackendAsset, FaderStoryAssetType } from '../types/FaderTypes';

/** Returns object with collection of `[id]: FaderStoryAsset` */
export const filterStoryAssetsByType = (type: FaderAssetType, assets: Record<string, FaderStoryAssetType>) => {
    const arrayFromAssetsByType = Object.entries(assets);
    const filteredArrayFromAssetsByType = arrayFromAssetsByType.filter(([_assetId, asset]) => asset.type === type);
    const returnObject = Object.fromEntries(filteredArrayFromAssetsByType);

    return returnObject;
};

/** Returns filtered object with collection of `[id]: FaderBackendAsset` */
export const getBackendAssetsFromStoryAssetsByGroupType = (
    group: FaderAssetGroupType,
    storyAssets: Record<string, FaderStoryAssetType>,
    backendAssets: Record<string, FaderBackendAsset>
) => {
    const returnObject: typeof backendAssets = {};

    for (const key in storyAssets) {
        if (storyAssets[key].group === group) {
            if (Object.prototype.hasOwnProperty.call(backendAssets, storyAssets[key].backendId)) {
                returnObject[storyAssets[key].backendId] = backendAssets[storyAssets[key].backendId];
            }
        }
    }

    return returnObject;
};

/** Returns Record of `FaderBackendAsset`'s filtered by `FaderAssetType` */
export const filterBackendAssetsByType = (type: FaderAssetType, backendAssets: Record<string, FaderBackendAsset>) => {
    const returnObject: Record<FaderAssetType, Record<FaderBackendAsset['id'], FaderBackendAsset>> = {
        Video: {},
        Audio: {},
        TextCard: {},
        Image: {},
        Interactive: {},
    };

    for (const key in backendAssets) {
        const currentBackendAsset = backendAssets[key];

        switch (backendAssets[key].media_type) {
            case 'video/mp4':
                // if (currentBackendAsset.attributes.width == currentBackendAsset.attributes.height * 2) {
                //     //
                // }
                returnObject.Video[key] = currentBackendAsset;
                break;

            case 'image/jpeg':
                returnObject.Image[key] = currentBackendAsset;
                break;

            default:
                break;
        }
    }
    //
};

export const getSortedBackendAssetsByGroupType = (backendAssets: Record<string, FaderBackendAsset>) => {
    const returnObject: Record<FaderAssetGroupType, Record<FaderBackendAsset['id'], FaderBackendAsset>> = {
        'Video2D': {},
        'Audio': {},
        'TextCard': {},
        'Image2D': {},
        'Interactive': {},
        '360': {},
    };

    for (const key in backendAssets) {
        const currentBackendAsset = backendAssets[key];

        switch (backendAssets[key].media_type) {
            case 'video/mp4':
                if (currentBackendAsset.attributes.width == currentBackendAsset.attributes.height * 2) {
                    // TODO need some other way of "finding" 360 video
                    returnObject['360'][key] = currentBackendAsset;
                } else {
                    returnObject.Video2D[key] = currentBackendAsset;
                }
                break;

            case 'image/jpeg':
                if (currentBackendAsset.attributes.width == currentBackendAsset.attributes.height * 2) {
                    // TODO this is a shoddy way of doing things - do we need a flag in Backend?
                    returnObject['360'][key] = currentBackendAsset;
                } else {
                    returnObject.Image2D[key] = currentBackendAsset;
                }
                break;

            default:
                break;
        }
    }

    return returnObject;
};
