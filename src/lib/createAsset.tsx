import { FaderAssetGroupType, FaderAssetType, FaderBackendAsset, FaderSceneAssetType } from '../types/FaderTypes';
import { arrayOfFaderAssetGroupTypes, defaultAsset, defaultAssetData } from './defaults';

const createAsset = (groupType: FaderAssetGroupType, backendAsset?: FaderBackendAsset) => {
    const groupTypeCounter = (groupType: FaderAssetGroupType) => {
        groupTypeCounts[groupType] += 1;
        return groupTypeCounts[groupType];
    };

    const newAsset: FaderSceneAssetType = { ...defaultAsset };
    newAsset.id = crypto.randomUUID();
    newAsset.data = { ...defaultAssetData };
    newAsset.data.headline = `New ${groupType} Asset ${groupTypeCounter(groupType)}`;

    newAsset.group = groupType;
    newAsset.type = groupAndTypeLinks[groupType];

    if (backendAsset) {
        newAsset.backendId = backendAsset.id;
        newAsset.data.name = backendAsset.name;
    }

    return newAsset;
};

const groupTypeCounts = (() => {
    const groupTypeCountRecord: Partial<Record<FaderAssetGroupType, number>> = {};
    arrayOfFaderAssetGroupTypes.forEach((groupType) => {
        groupTypeCountRecord[groupType] = 0;
    });
    return groupTypeCountRecord as Record<FaderAssetGroupType, number>;
})();

type FaderAssetGroup360Type = { '360': 'Image' | 'Video' };
export const groupAndTypeLinks: Omit<Record<FaderAssetGroupType, FaderAssetType>, '360'> & FaderAssetGroup360Type = {
    'TextCard': 'TextCard',
    'Audio': 'Audio',
    '360': 'Image', // or 'Video'
    'Video2D': 'Video',
    'SceneLink': 'SceneLink',
    'Image2D': 'Image',
};

export { createAsset };
