import { FaderAssetType, FaderScene, FaderStoryAsset } from '../types/FaderTypes';

/** Returns object with all `StoryAsset`'s of select `FaderScene` */
export const filterStoryAssetsByScene = (scene: FaderScene, assets: Record<string, FaderStoryAsset>) => {
    const returnObject: typeof assets = {};

    scene.assetIds
        .map((assetId) => {
            return assets[assetId];
        })
        .forEach((asset) => {
            returnObject[asset.id] = asset;
        });

    return returnObject;
};

/** Returns object with collection of `[id]: StoryAsset` */
export const filterStoryAssetsByType = (type: FaderAssetType, assets: Record<string, FaderStoryAsset>) => {
    const arrayFromAssetsByType = Object.entries(assets);
    const filteredArrayFromAssetsByType = arrayFromAssetsByType.filter(([_assetId, asset]) => asset.type === type);
    const returnObject = Object.fromEntries(filteredArrayFromAssetsByType);

    return returnObject;
};
