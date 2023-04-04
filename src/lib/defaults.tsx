/** Used to feed default values onMount before backend data is dealt with */

import { FaderSceneType, FaderStoryAssetType, FaderAssetGroupType, FaderSceneDataType, FaderStoryDataType } from '../types/FaderTypes';

/* Stories and Scenes */

export const defaultSceneData: FaderSceneDataType = {
    assetIds: [],
    assetOrderByGroup: {
        '360': [],
        'Audio': [],
        'Image2D': [],
        'Interactive': [],
        'TextCard': [],
        'Video2D': [],
    },
    assets: {},
    environment: {
        seed: 0,
        preset: '',
        positionY: 0,
        enableGroundIn360: false,
    },
    ui: {
        selectedAssetIdByGroup: {},
        selectedAssetGroup: 'TextCard',
    },
};

export const defaultScene: FaderSceneType = {
    created_at: '',
    data: defaultSceneData,
    duration: 0,
    id: '',
    name: '',
    navigatable: false,
    preview_image: '',
    primary_asset_lease_id: '',
    project_id: '',
    thumbnail_image: '',
    updated_at: '',
};

export const defaultProjectData: FaderStoryDataType = {
    assetBlueprints: {},
    sceneOrder: [],
    ui: {
        nextTutorialStep: -1,
        selectedSceneId: '',
        showEnvironmentInfo: false,
        showSceneInfo: false,
        userSelectedThumbnail: false,
    },
    uploadedAssetIds: [],
    version: 0,
};

/* Assets */

export const defaultAssetProperties: FaderStoryAssetType['properties'] = {
    positionX: 0,
    positionY: 0,
    positionZ: 10,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scale: 1,
    scaleX: 1, // TODO we're not doing anything with this to date?
    scaleY: 1, // see above
    scaleZ: 1, // see above
};

export const defaultAssetData: FaderStoryAssetType['data'] = {
    backgroundColor: '#222222' /* as above ^ */,
    backgroundOn: false,
    backgroundOpacity: 1,
    body: '',
    cardHeight: 1,
    cardLevel: 1,
    cardWidth: 100,
    frameColor: '#888888' /* as above ^ */,
    frameOn: true,
    frameOpacity: 1,
    headline: '',
    legacyInteractiveSize: true,
    nextSceneId: '',
    textColor: '#ffffff' /* non-empty so leva understands this as a color field */,
};

export const defaultAssetDisplay: FaderStoryAssetType['display'] = {
    caption: '',
    linkedBackendIds: [],
    showInteractive: false,
};

export const defaultAsset: FaderStoryAssetType = {
    backendId: '',
    data: defaultAssetData,
    display: defaultAssetDisplay,
    group: 'TextCard',
    id: '',
    properties: defaultAssetProperties,
    type: 'TextCard',
};

export const arrayOfFaderAssetGroupTypes: FaderAssetGroupType[] = ['Video2D', 'Interactive', 'Image2D', 'TextCard', 'Audio', '360'];
