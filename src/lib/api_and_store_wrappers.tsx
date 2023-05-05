import useZustand from './zustand/zustand';
import { faderNestedObjectKeysAreEqual, syncProjectData, syncSceneData } from './createData';
import { FaderBackendAsset, FaderAssetGroupType, FaderSceneType, FaderSceneAssetType, FaderStoryType } from '../types/FaderTypes';
import {
    api_ListBackendAssetsAssociatedWithProject,
    api_ListProjects,
    api_ListProjectScenes,
    api_RequestAuthToken,
    api_ShowProject,
    api_UpdateProject,
    api_UpdateScene,
} from './axios';
import { createAsset } from './createAsset';
import { defaultProjectData, defaultSceneData } from './defaults';
import buildConfig from '../buildConfig';

const devMode = buildConfig.dev.devMode;

const { storeDeleteFaderStoryAsset, storeAddFaderStoryAssetToScene, storeUpdateFaderStoryAsset, storeUpdateFaderScene } =
    useZustand.getState().methods;

/** Requests Auth Token from Api, sends to Zustand */
export const wrappers_AuthTokenToStore = async (userLoginData: { username: string; password: string }) => {
    const storeSetApiAuthToken = useZustand.getState().methods.storeSetApiAuthToken;

    const authToken = await api_RequestAuthToken(userLoginData).then((result) => result);
    storeSetApiAuthToken(authToken as unknown as string);
};

/** Requests a Project/FaderStory & its Scenes & associated BackendAssets, fills .data fields if need be, sends to Zustand */
export const wrappers_FirstProjectInitAndSendToStore = async () => {
    const { storeSetFaderStory, storeSetFaderScenes, storeSetFaderStoryBackendAssets } = useZustand.getState().methods;

    /*  
        Get Project (first in list for now).
        If .data field is empty/incomplete, add default properties.
    */
    const projects = await api_ListProjects().then((result) => result);
    const firstProjectId = (projects as FaderStoryType[])[0].id; // TODO Only ever need one Project, id will likely be passed in externally
    const firstProject = (await api_ShowProject(firstProjectId)) as FaderStoryType;

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

    /*  
        Get FaderScene's associated with FaderStory.
        If their .data fields are null (so an empty scene), add default data fields. 
        Then send to store (fader.faderScenes) .
    */
    const allProjectScenes = (await api_ListProjectScenes(firstProjectId)) as FaderSceneType[];
    if (allProjectScenes.length === 0) {
        throw new Error('FaderStory has no associated Scenes!');
    } else {
        allProjectScenes.forEach((projectScene, idx) => {
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

            if (firstProject.data.sceneOrder.length == idx) {
                firstProject.data.sceneOrder.push(projectScene.id);
            }
        });

        const scenes = arrayToRecordOfIds(allProjectScenes);
        storeSetFaderScenes(scenes);
    }

    /*  
        Get a project's backend assets.
        Add to project .data.uploadedAssetIds
        Send to store (fader.faderStoryBackendAssets).
    */
    const projectBackendAssets = (await api_ListBackendAssetsAssociatedWithProject(firstProjectId)) as FaderBackendAsset[];
    const backendAssets = arrayToRecordOfIds(projectBackendAssets);
    storeSetFaderStoryBackendAssets(backendAssets);

    if (projectBackendAssets.length > 0) {
        // removeDuplicatesInArray(firstProject.data.uploadedAssetIds)

        projectBackendAssets.forEach((backendAsset) => {
            if (!firstProject.data.uploadedAssetIds.includes(backendAsset.id)) {
                firstProject.data.uploadedAssetIds.push(backendAsset.id);
            }
        });
    }

    /* Send ready Project to store */
    storeSetFaderStory(firstProject);

    /* And to remote */
    await api_UpdateProject(firstProjectId, firstProject);
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
