import { FaderAssetGroupType, FaderAssetType, FaderBackendAsset, FaderSceneAssetType } from '../types/FaderTypes';
import { arrayOfFaderAssetGroupTypes, arrayOfFaderAssetTypes } from '../lib/defaults';

/** Returns object with collection of `[id]: FaderStoryAsset` */
export const filterStoryAssetsByType = (type: FaderAssetType, assets: Record<string, FaderSceneAssetType>) => {
    const arrayFromAssetsByType = Object.entries(assets);
    const filteredArrayFromAssetsByType = arrayFromAssetsByType.filter(([_assetId, asset]) => asset.type === type);
    const returnObject = Object.fromEntries(filteredArrayFromAssetsByType);

    return returnObject;
};

/** Returns filtered object with collection of `[id]: FaderBackendAsset` */
export const getBackendAssetsFromStoryAssetsByGroupType = (
    group: FaderAssetGroupType,
    storyAssets: Record<string, FaderSceneAssetType>,
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

export const getSortedBackendAssetsByGroupType = (backendAssets: Record<string, FaderBackendAsset>) => {
    const returnGroupTypeObject = (() => {
        const returnRecord: Partial<Record<FaderAssetGroupType, Record<FaderBackendAsset['id'], FaderBackendAsset>>> = {};
        arrayOfFaderAssetGroupTypes.forEach((groupType) => {
            returnRecord[groupType] = {};
        });
        return returnRecord as Record<FaderAssetGroupType, Record<FaderBackendAsset['id'], FaderBackendAsset>>;
    })();

    for (const key in backendAssets) {
        const currentBackendAsset = backendAssets[key];

        switch (backendAssets[key].media_type) {
            case 'video/mp4':
                if (currentBackendAsset.attributes.width == currentBackendAsset.attributes.height * 2) {
                    // TODO need some other way of "finding" 360 video
                    returnGroupTypeObject['360'][key] = currentBackendAsset;
                } else {
                    returnGroupTypeObject.Video2D[key] = currentBackendAsset;
                }
                break;

            case 'image/jpeg':
                if (currentBackendAsset.attributes.width == currentBackendAsset.attributes.height * 2) {
                    // TODO this is a shoddy way of doing things - do we need a flag in Backend?
                    returnGroupTypeObject['360'][key] = currentBackendAsset;
                } else {
                    returnGroupTypeObject.Image2D[key] = currentBackendAsset;
                }
                break;

            default:
                break;
        }
    }

    return returnGroupTypeObject;
};

/** Sorts `FaderBackendAsset`'s into `FaderAssetType`'s by their `media_type` */
export const getSortedBackendAssetsByType = (backendAssets: Record<string, FaderBackendAsset>) => {
    const returnTypeObject = (() => {
        const returnRecord: Partial<Record<FaderAssetType, Record<FaderBackendAsset['id'], FaderBackendAsset>>> = {};
        arrayOfFaderAssetTypes.forEach((type) => {
            returnRecord[type] = {};
        });
        return returnRecord as Record<FaderAssetType, Record<FaderBackendAsset['id'], FaderBackendAsset>>;
    })();

    for (const key in backendAssets) {
        const currentBackendAsset = backendAssets[key];

        const mediaType = backendAssets[key].media_type;

        /* WARN This seems like it could break easily? At the least, likely need to filter away filetypes we cannot display/support? */
        if (mediaType) {
            switch (true) {
                case mediaType.includes('video'):
                    returnTypeObject.Video[key] = currentBackendAsset;
                    break;

                case mediaType.includes('image'):
                    returnTypeObject.Image[key] = currentBackendAsset;
                    break;

                case mediaType.includes('audio'):
                    returnTypeObject.Audio[key] = currentBackendAsset;
                    break;

                default:
                    break;
            }
        }
    }

    return returnTypeObject;
};
