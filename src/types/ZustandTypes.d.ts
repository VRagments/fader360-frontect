import { StoreType } from 'leva/dist/declarations/src/types';
import { FaderBackendAsset, FaderSceneType, FaderStoryType, FaderSceneAssetType, FaderAssetGroupType } from './FaderTypes';

export interface ZustandState {
    siteData: {
        //
    };
    methods: {
        storeSetCurrentSceneId: (scene_id: FaderSceneType['id']) => void;
        /** Sets Project */
        storeSetFaderStory: (story: FaderStoryType) => void;
        /** Store Scenes of a Project */
        storeSetFaderScenes: (scenes: Record<string, FaderSceneType>) => void;
        storeUpdateFaderScene: (scene: FaderSceneType) => void;
        storeUpdateFaderSceneData: (sceneId: FaderSceneType['id'], sceneData: FaderSceneType['data']) => void;
        /** Store Assets associated with Scene */
        storeSetFaderStoryBackendAssets: (backendAssets: Record<string, FaderBackendAsset>) => void;
        /** Adds `storyAsset` to `scenes[sceneId]` by pushing to `.assetIds` and to `.assetOrderByGroup[storyAsset.group]` (creating an entry if the latter is missing) */
        storeAddFaderStoryAssetToScene: (storyAsset: FaderSceneAssetType, sceneId: FaderSceneType['id']) => void;
        storeUpdateFaderStoryAsset: (storyAsset: FaderSceneAssetType, sceneId: FaderSceneType['id']) => void;
        storeDeleteFaderStoryAsset: (storyAsset: FaderSceneAssetType, sceneId: FaderSceneType['id']) => void;
        storeAddLevaPanel: (levaPanel: LevaPanelOptions, replace?: boolean) => void;
        storeSetFaderLevaOptionsStore: (optionsStore: StoreType) => void;
    };
    fader: {
        faderStory: FaderStoryType | null;
        faderScenes: Record<string, FaderSceneType> | null;
        currentFaderSceneId: FaderSceneType['id'];
        faderStoryBackendAssets: Record<string, FaderBackendAsset>;
        faderLevaPanels: LevaPanelOptions[];
        faderLevaOptionsStore: StoreType | null;
    };
}

export type LevaPanelOptions = { id: FaderSceneAssetType['id']; group: FaderAssetGroupType; store: StoreType };
