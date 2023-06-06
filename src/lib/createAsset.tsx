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

    const newAssetType = groupAndTypeLinks[groupType];
    if (Array.isArray(newAssetType) && newAssetType.length) {
        if (groupType === 'SceneLink') {
            newAsset.type = 'TextCard';
        } else {
            // WARN until I find a better solution:
            newAsset.type = newAssetType[0];
        }
    } else {
        newAsset.type = newAssetType as FaderAssetType;
    }

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

type FaderAssetGroupTypes = { '360': FaderAssetType[]; 'SceneLink': FaderAssetType[] };
export const groupAndTypeLinks: Omit<Record<FaderAssetGroupType, FaderAssetType>, '360' | 'SceneLink'> & FaderAssetGroupTypes = {
    'TextCard': 'TextCard',
    'Audio': 'Audio',
    '360': ['Image', 'Video'],
    'Video2D': 'Video',
    'SceneLink': ['Image', 'TextCard'],
    'Image2D': 'Image',
};

export { createAsset };
