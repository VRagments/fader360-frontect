import useZustand from './zustand/zustand';
import { faderNestedObjectKeysAreEqual, syncProjectData, syncSceneData } from './createData';
import { FaderBackendAsset, FaderAssetGroupType, FaderSceneType, FaderSceneAssetType, FaderStoryType } from '../types/FaderTypes';
import {
    api_ListBackendAssetsAssociatedWithProject,
    api_ListBackendAssetsAssociatedWithPublicProject,
    api_ListProjectScenes,
    api_ListPublicProjectScenes,
    api_ShowProject,
    api_ShowPublicProject,
    api_UpdateProject,
    api_UpdateScene,
} from './axios';
import { createAsset } from './createAsset';
import { defaultProjectData, defaultSceneData } from './defaults';
import buildConfig from '../buildConfig';

const devMode = buildConfig.dev.devMode;

const {
    storeSetCurrentSceneId,
    storeDeleteFaderStoryAsset,
    storeAddFaderStoryAssetToScene,
    storeUpdateFaderStoryAsset,
    storeUpdateFaderScene,
    storeSetFaderStory,
    storeSetFaderScenes,
    storeSetFaderStoryBackendAssets,
} = useZustand.getState().methods;

/** Requests a Project/FaderStory & its Scenes & associated BackendAssets, fills .data fields if need be, sends to Zustand */
export const wrappers_FirstProjectInitAndSendToStore = async (sceneIdParam: string) => {
    /*  1.
        Get a project's backend assets.
        Send to store (fader.faderStoryBackendAssets).
    */
    const projectBackendAssets = (await api_ListBackendAssetsAssociatedWithProject(sceneIdParam)) as FaderBackendAsset[];
    const backendAssets = arrayToRecordOfIds(projectBackendAssets);
    storeSetFaderStoryBackendAssets(backendAssets);

    /*  2.
        Get Project
        If .data field is empty/incomplete, add default properties.
    */
    const firstProject = (await api_ShowProject(sceneIdParam)) as FaderStoryType;

    if (
        !Object.keys(firstProject.data).length ||
        !faderNestedObjectKeysAreEqual({ object1: firstProject.data, object2: defaultProjectData })
    ) {
        devMode &&
            // eslint-disable-next-line no-console
            console.log(
                '%c[api_and_store_wrappers]',
                'color: #23c891',
                `Fader Story's ${firstProject.id} .data folder is null or incomplete, filling with required fields!`
            );

        firstProject.data = syncProjectData(firstProject.data);
    }

    /*  3.
        Get FaderScene's associated with FaderStory.
        If their .data fields are null (so an empty scene), add default data fields. 
        Then send to store (fader.faderScenes) .
    */
    const allProjectScenes = (await api_ListProjectScenes(sceneIdParam)) as FaderSceneType[];
    if (allProjectScenes.length === 0) {
        // eslint-disable-next-line no-console
        console.error('FaderStory has no associated Scenes!');
    } else {
        allProjectScenes.forEach((projectScene) => {
            if (
                !Object.keys(projectScene.data).length ||
                !faderNestedObjectKeysAreEqual({
                    object1: projectScene.data,
                    object2: defaultSceneData,
                    opts: { excludeObjKeys: ['assets'] },
                })
            ) {
                devMode &&
                    // eslint-disable-next-line no-console
                    console.log(
                        '%c[api_and_store_wrappers]',
                        'color: #23c891',
                        `Fader Scene's (${projectScene.id}) .data folder is null or incomplete, filling with required fields!`
                    );

                projectScene.data = syncSceneData(projectScene.data);

                api_UpdateScene(projectScene).catch((e: string) => new Error(e));
            }

            if (!firstProject.data.sceneOrder.includes(projectScene.id)) {
                firstProject.data.sceneOrder.push(projectScene.id);
            }

            /* Check if a backendAsset has been removed from Project and 'cleanse' Scenes: */
            projectScene.data.assetIds.forEach((assetId) => {
                const scnDta = projectScene.data;

                if (!(scnDta.assets[assetId].backendId in backendAssets)) {
                    if (scnDta.assets[assetId].group !== 'TextCard' && scnDta.assets[assetId].group !== 'SceneLink') {
                        delete scnDta.assets[assetId];
                        scnDta.assetIds = scnDta.assetIds.filter((assId) => assetId !== assId);

                        for (const key in scnDta.assetOrderByGroup) {
                            if (scnDta.assetOrderByGroup[key as FaderAssetGroupType].includes(assetId)) {
                                scnDta.assetOrderByGroup[key as FaderAssetGroupType].splice(
                                    scnDta.assetOrderByGroup[key as FaderAssetGroupType].findIndex((id) => assetId === id),
                                    1
                                );

                                api_UpdateScene(projectScene).catch((e: string) => new Error(e));
                            }
                        }
                    }
                }
            });
        });

        const scenes = arrayToRecordOfIds(allProjectScenes);
        storeSetFaderScenes(scenes);
    }

    /* Sync incoming allProjectScenes with existing sceneOrder: */
    const syncedSceneOrder = firstProject.data.sceneOrder.filter((sceneId) => allProjectScenes.some((scene) => scene.id == sceneId));
    firstProject.data.sceneOrder = syncedSceneOrder;

    /* 4. Send ready Project to store */
    storeSetFaderStory(firstProject);

    /* 5. And to remote */
    await api_UpdateProject(sceneIdParam, firstProject);
};

/** Requests a PUBLIC Project/FaderStory & its Scenes & associated BackendAssets & sends to Zustand. Does not mutate incoming data in any form, so technically prone to errors in api "versions" I guess? */
export const wrappers_ViewerProjectSyncToStore = async (storyIdParam: FaderStoryType['id']) => {
    const { storeSetFaderStory, storeSetFaderScenes, storeSetFaderStoryBackendAssets } = useZustand.getState().methods;

    /*  1.
        Get Project, send to Store
    */
    const firstProject = (await api_ShowPublicProject(storyIdParam)) as FaderStoryType;
    storeSetFaderStory(firstProject);

    /*  2.
        Get FaderScene's associated with FaderStory, send to store (fader.faderScenes) .
    */
    const allProjectScenes = (await api_ListPublicProjectScenes(storyIdParam)) as FaderSceneType[];
    if (allProjectScenes.length === 0) {
        throw new Error('FaderStory has no associated Scenes!');
    }

    const scenes = arrayToRecordOfIds(allProjectScenes);
    storeSetFaderScenes(scenes);

    /*  3.
        Get a project's backend assets, send to store (fader.faderStoryBackendAssets).
    */
    const projectBackendAssets = (await api_ListBackendAssetsAssociatedWithPublicProject(storyIdParam)) as FaderBackendAsset[];

    const backendAssets = arrayToRecordOfIds(projectBackendAssets);
    storeSetFaderStoryBackendAssets(backendAssets);
};

export const wrappers_UpdateStoryAssetInStoreAndRemote = (storyAsset: FaderSceneAssetType, scene: FaderSceneType) => {
    const asyncUpdateWrapper = async () => {
        storeUpdateFaderStoryAsset(storyAsset, scene.id);

        const updatedScene = useZustand.getState().fader.faderScenes![scene.id];

        await api_UpdateScene(updatedScene);
    };

    asyncUpdateWrapper().catch((e) => new Error(e as string));
};

/** Creates new empty Asset, adds it to Store and Remote */
export const wrappers_AddNewAssetToSceneStoreAndRemote = (
    backendAsset: FaderBackendAsset,
    groupType: FaderAssetGroupType,
    scene: FaderSceneType
) => {
    /* New asset definition */
    const newAsset = createAsset(groupType, backendAsset);

    /* Add asset to FaderScene */
    storeAddFaderStoryAssetToScene(newAsset, scene.id);
    const updatedScene = useZustand.getState().fader.faderScenes![scene.id];

    api_UpdateScene(updatedScene).catch((e) => new Error(e as string));
};

/** Deletes asset from local and remote (the latter via updating scene call) */
export const wrappers_DeleteAssetFromSceneStoreAndRemote = (asset: FaderSceneAssetType, scene: FaderSceneType) => {
    storeDeleteFaderStoryAsset(asset, scene.id);
    const updatedScene = useZustand.getState().fader.faderScenes![scene.id];
    api_UpdateScene(updatedScene).catch((e) => new Error(e as string));
};

export const wrappers_UpdateSceneInLocalAndRemote = (scene: FaderSceneType) => {
    storeUpdateFaderScene(scene);
    const updatedFaderScene = useZustand.getState().fader.faderScenes![scene.id];
    api_UpdateScene(updatedFaderScene).catch((e) => new Error(e as string));
};

/** Sets sceneId to Store and modifies query param in URL */
export const wrappers_SetSceneIdInStoreAndUrl = (sceneId: FaderSceneType['id']) => {
    const url = new URL(document.location as unknown as URL);
    url.searchParams.set('scene_id', sceneId);
    history.pushState({}, '', url);

    storeSetCurrentSceneId(sceneId);
};

export const wrappers_SetStoryToStoreAndRemote = (story: FaderStoryType) => {
    api_UpdateProject(story.id, story).catch((e) => new Error(e as string));
    storeSetFaderStory(story);
};

/*
 * Local Functions
 */

/** Converts an array of T into an object containing the array's elements, with the elements id as key value */
const arrayToRecordOfIds = <T extends { id: string }>(array: Array<T>) => {
    const record: Record<string, T> = {};

    array.forEach((arrayElement) => {
        record[arrayElement.id] = arrayElement;
    });

    return record;
};
