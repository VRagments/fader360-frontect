import { FaderBackendAsset, FaderStory } from '../types/FaderTypes';
import { cloneDeep } from 'lodash';

const mockFaderStoryData: FaderStory['data'] = {
    version: 1.4,
    uploadedAssetIds: [],
    ui: {
        userSelectedThumbnail: true,
        showSceneInfo: false,
        showEnvironmentInfo: false,
        selectedSceneId: 'b5fb8ff8-225b-4ac9-a8db-9b813dd96ced',
        nextTutorialStep: -1,
    },
    scenes: {
        'f8c06cac-c7f2-452d-86e8-8228cc95f52b': {
            ui: {
                selectedAssetIdByGroup: {},
                selectedAssetGroup: 'Video2D',
            },
            primary_asset_id: '',
            name: 'Scene1 (360 Image)',
            jumpTo: true,
            id: 'f8c06cac-c7f2-452d-86e8-8228cc95f52b',
            environment: {
                seed: 1,
                preset: 'egypt',
                positionY: 0,
                enableGroundIn360: false,
            },
            duration: 12000,
            assetOrderByGroup: {
                '360': [],
                // Video2D: ['ca9b8aa1-084b-585b-bda5-dc8c9d7f4751'],
                // Interactive: ['182a5c28-0f2f-5eeb-b536-70d407e4821d'],
                // Image2D: ['a44a7779-9db6-5ac7-8983-97aae1304785', '56294545-b679-5719-ac94-b31cb30f2705'],
            },
            assetIds: [],
        },
        'z9c06cac-c7f2-452d-86e8-8228cc95f52b': {
            ui: {
                selectedAssetIdByGroup: {},
                selectedAssetGroup: 'Video2D',
            },
            primary_asset_id: '',
            name: 'Scene2 (360 Video)',
            jumpTo: true,
            id: 'z9c06cac-c7f2-452d-86e8-8228cc95f52b',
            environment: {
                seed: 1,
                preset: 'egypt',
                positionY: 0,
                enableGroundIn360: false,
            },
            duration: 12000,
            assetOrderByGroup: {
                '360': [],
                // Video2D: ['ca9b8aa1-084b-585b-bda5-dc8c9d7f4751'],
                // Interactive: ['182a5c28-0f2f-5eeb-b536-70d407e4821d'],
                // Image2D: ['a44a7779-9db6-5ac7-8983-97aae1304785', '56294545-b679-5719-ac94-b31cb30f2705'],
            },
            assetIds: [],
        },
    },
    sceneOrder: [
        'f8c06cac-c7f2-452d-86e8-8228cc95f52b', // Scene1 (360 Image)
        'z9c06cac-c7f2-452d-86e8-8228cc95f52b', // Scene2 (360 Video)
    ],
    // Modified Blueprint Assets attached to the Scene(s), I figure?
    assets: {},
    // List of unique elements, no duplicates. Blueprints mean..? Not global I'm sure
    assetBlueprints: {},
};

/** Constructs a temporary/fake .data object to work with locally (until we correctly serve it from backend) */
const mangleAssetsFromApiWithLocalData = (apiProjectResult: FaderStory, assets: FaderBackendAsset[]) => {
    const combinedProject = apiProjectResult;
    combinedProject.data = cloneDeep(mockFaderStoryData); // This seems incredibly stupid, but without cloneDeep I could not push to .assetIds and .assetOrderByGroup['360'] without error..

    // WARN lame hardcode again
    const image360Scene = combinedProject.data.scenes['f8c06cac-c7f2-452d-86e8-8228cc95f52b'];
    const video360Scene = combinedProject.data.scenes['z9c06cac-c7f2-452d-86e8-8228cc95f52b'];

    assets.forEach((asset) => {
        if (asset.media_type === 'image/jpeg') {
            image360Scene.assetIds.push(asset.id);
            image360Scene.assetOrderByGroup['360']!.push(asset.id);
        } else if (asset.media_type === 'video/mp4') {
            video360Scene.assetIds.push(asset.id);
            video360Scene.assetOrderByGroup['360']!.push(asset.id);
        }
    });

    return combinedProject;
};

export { mockFaderStoryData, mangleAssetsFromApiWithLocalData };
