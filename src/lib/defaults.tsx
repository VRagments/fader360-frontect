/** Used to feed default values onMount before backend data is dealt with */

import {
    FaderSceneType,
    FaderSceneAssetType,
    FaderAssetGroupType,
    FaderSceneDataType,
    FaderStoryDataType,
    FaderAssetType,
} from '../types/FaderTypes';

/* Asset Consumption & Display */

/* BG Sphere */
export const backgroundSphereGeometryArgs: [number, number, number] = [100, 64, 64]; // first arg does sort of 'zoom' (sphere radius)

/*/

/* Stories and Scenes */

export const arrayOfFaderAssetGroupTypes: FaderAssetGroupType[] = ['Video2D', 'SceneLink', 'Image2D', 'TextCard', 'Audio', '360'];
export const arrayOfFaderAssetTypes: FaderAssetType[] = ['Video', 'Image', 'TextCard', 'Audio'];

export const defaultSceneData: FaderSceneDataType = {
    assetIds: [],
    assetOrderByGroup: (() => {
        const assetGroupRecord: Partial<FaderSceneDataType['assetOrderByGroup']> = {};
        arrayOfFaderAssetGroupTypes.forEach((assetGroupType) => {
            assetGroupRecord[assetGroupType] = [];
        });
        return assetGroupRecord as FaderSceneDataType['assetOrderByGroup'];
    })(),
    assets: {},
    environment: {
        enableGroundIn360: false,
        positionY: 0,
        preset: '',
        radius: backgroundSphereGeometryArgs[0],
        seed: 0,
    },
    ui: {
        selectedAssetIdByGroup: {},
        selectedAssetGroup: 'TextCard',
    },
    enableGrid: true,
};

export const defaultScene: FaderSceneType = {
    created_at: '',
    data: defaultSceneData,
    duration: '12',
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
    version: 0,
};

/* Assets */

export const defaultAssetProperties: FaderSceneAssetType['properties'] = {
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

export const defaultAssetData: FaderSceneAssetType['data'] = {
    autoPlay: false,
    backgroundColor: '#222222' /* as above ^ */,
    backgroundOn: true,
    backgroundOpacity: 0.75,
    body: 'Body Text!',
    cardHeight: 1,
    cardLevel: 1,
    cardWidth: 100,
    frameColor: '#888888' /* as above ^ */,
    frameOn: true,
    frameOpacity: 1,
    headline: '',
    legacyInteractiveSize: true,
    loop: false,
    name: '',
    nextSceneId: '',
    textColor: '#ffffff' /* non-empty so leva understands this as a color field */,
    subtitles: null,
};

export const defaultAssetDisplay: FaderSceneAssetType['display'] = {
    caption: '',
    linkedBackendIds: [],
    showInteractive: false,
};

export const defaultAsset: FaderSceneAssetType = {
    backendId: '',
    data: defaultAssetData,
    display: defaultAssetDisplay,
    group: 'TextCard',
    id: '',
    properties: defaultAssetProperties,
    type: 'TextCard',
};
