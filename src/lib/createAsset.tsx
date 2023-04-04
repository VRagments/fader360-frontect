import { FaderAssetGroupType, FaderAssetType, FaderStoryAssetType } from '../types/FaderTypes';
import { defaultAsset, defaultAssetData } from './defaults';

const createAsset = (groupType: FaderAssetGroupType) => {
    const groupTypeCounter = (groupType: FaderAssetGroupType) => {
        groupTypeCounts[groupType] += 1;
        return groupTypeCounts[groupType];
    };

    const newAsset: FaderStoryAssetType = { ...defaultAsset };
    newAsset.id = crypto.randomUUID();
    newAsset.type = groupAndTypeLinks[groupType];
    newAsset.group = groupType;
    newAsset.data = { ...defaultAssetData };
    newAsset.data.headline = `New ${groupType} Asset ${groupTypeCounter(groupType)}`;

    return newAsset;
};

const groupTypeCounts = {
    'TextCard': 0,
    'Audio': 0,
    '360': 0,
    'Video2D': 0,
    'Interactive': 0,
    'Image2D': 0,
};

type FaderAssetGroup360Type = { '360': 'Image' | 'Video' };
const groupAndTypeLinks: Omit<Record<FaderAssetGroupType, FaderAssetType>, '360'> & FaderAssetGroup360Type = {
    'TextCard': 'TextCard',
    'Audio': 'Audio',
    '360': 'Image', // or 'Video'
    'Video2D': 'Video',
    'Interactive': 'Interactive',
    'Image2D': 'Image',
};

export { createAsset };
