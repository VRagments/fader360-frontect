/* There is a bigger dump of an actual FaderStory (from live 'old' Fader) as .json in root folder */

import { FaderBackendAsset, FaderStory, FaderStoryAsset } from '../types/FaderTypes';
import { cloneDeep } from 'lodash';
import { defaultAssetData, defaultAssetDisplay, defaultAssetProperties } from './emptyDefaults';

const mockFaderStoryData: FaderStory['data'] = {
    version: 1.4,
    uploadedAssetIds: [],
    ui: {
        userSelectedThumbnail: true,
        showSceneInfo: false,
        showEnvironmentInfo: false,
        selectedSceneId: 'f8c06cac-c7f2-452d-86e8-8228cc95f52b',
        nextTutorialStep: -1,
    },
    scenes: {
        'f8c06cac-c7f2-452d-86e8-8228cc95f52b': {
            ui: {
                selectedAssetIdByGroup: {},
                selectedAssetGroup: '360',
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
                'TextCard': ['20657c4f-01f7-5048-8f47-652763f60bd6'],
            },
            assetIds: ['20657c4f-01f7-5048-8f47-652763f60bd6'],
        },
        'z9c06cac-c7f2-452d-86e8-8228cc95f52b': {
            ui: {
                selectedAssetIdByGroup: {},
                selectedAssetGroup: '360',
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
            },
            assetIds: [],
        },
    },
    sceneOrder: [
        'f8c06cac-c7f2-452d-86e8-8228cc95f52b', // Scene1 (360 Image)
        'z9c06cac-c7f2-452d-86e8-8228cc95f52b', // Scene2 (360 Video)
    ],
    // Modified Blueprint Assets attached to the Scene(s), I figure?
    assets: {
        // The TextCard has no backendId
        '20657c4f-01f7-5048-8f47-652763f60bd6': {
            type: 'TextCard',
            properties: {
                scaleZ: 1,
                scaleY: 1,
                scaleX: 1,
                scale: 1,
                rotationZ: 0,
                rotationY: 134.5,
                rotationX: 0,
                positionZ: -10,
                positionY: 0,
                positionX: 0,
            },
            id: '20657c4f-01f7-5048-8f47-652763f60bd6',
            group: 'TextCard',
            display: {
                showInteractive: false,
                linkedBackendIds: [],
                caption: 'A Caption',
            },
            data: {
                textColor: '#ffffff',
                nextSceneId: '',
                legacyInteractiveSize: true,
                headline: 'Textcard Headline',
                frameOpacity: 0.7,
                frameOn: true,
                frameColor: '#ff040b',
                cardWidth: 10,
                cardLevel: 1,
                cardHeight: 10,
                body: 'Textcard Body Textcard Body Textcard Body Textcard Body Textcard Body Textcard Body Textcard Body Textcard Body Textcard Body Textcard Body Textcard Body Textcard Body',
                backgroundOpacity: 0.7,
                backgroundOn: true,
                backgroundColor: '#009bff',
            },
            backendId: '',
        },
    },
    // List of unique elements, no duplicates. Blueprints mean..? Not global I'm sure
    assetBlueprints: {},
};

/** Constructs a temporary/fake .data object to work with locally (until we correctly serve it from backend) */
const mangleAssetsFromApiWithLocalData = (apiProjectResult: FaderStory, assets: FaderBackendAsset[]) => {
    const combinedProject = apiProjectResult;
    combinedProject.data = cloneDeep(mockFaderStoryData); // This seems incredibly stupid, but without cloneDeep I could not push to .assetIds and .assetOrderByGroup['360'] without error..

    assets.forEach((asset, idx) => {
        combinedProject.data.uploadedAssetIds.push(asset.id);

        const freshStoryAsset: FaderStoryAsset = {
            type: '360',
            display: defaultAssetDisplay,
            backendId: asset.id,
            data: defaultAssetData,
            id: `TEMP-${idx}-backendId-${asset.id}`, // id only in this story I guess??
            group: '360',
            properties: defaultAssetProperties,
        };
        // TODO does data.assets only list those FaderBackendAsset's actually placed in a Scene?
        combinedProject.data.assets[asset.id] = freshStoryAsset;

        // WARN lame hardcode again
        if (asset.media_type === 'image/jpeg') {
            const image360Scene = combinedProject.data.scenes['f8c06cac-c7f2-452d-86e8-8228cc95f52b'];

            image360Scene.assetIds.unshift(asset.id); // WARN using unshift because in Scene1, a TextCard is added already, however I am calling assetIds[0] in WhichBackground
            image360Scene.assetOrderByGroup['360']!.push(asset.id);
        } else if (asset.media_type === 'video/mp4') {
            const video360Scene = combinedProject.data.scenes['z9c06cac-c7f2-452d-86e8-8228cc95f52b'];

            video360Scene.assetIds.unshift(asset.id);
            video360Scene.assetOrderByGroup['360']!.push(asset.id);
        }
    });

    return combinedProject;
};

export { mockFaderStoryData, mangleAssetsFromApiWithLocalData };
