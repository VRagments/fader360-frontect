import { StoreType } from 'leva/dist/declarations/src/types';
import { FaderBackendAsset, FaderSceneType, FaderStoryType, FaderStoryAssetType, FaderAssetGroupType } from './FaderTypes';

export interface ZustandState {
    siteData: {
        apiAuthToken: string;
    };
    methods: {
        /** Sets Api Token from Api call */
        storeSetApiAuthToken: (access_token: string) => void;
        /** Sets Project */
        storeSetFaderStory: (story: FaderStoryType) => void;
        /** Store Scenes of a Project */
        storeSetFaderScenes: (scenes: Record<string, FaderSceneType>) => void;
        storeUpdateFaderScene: (scene: FaderSceneType) => void;
        storeUpdateFaderSceneData: (sceneId: FaderSceneType['id'], sceneData: FaderSceneType['data']) => void;
        /** Store Assets associated with Scene */
        storeSetFaderStoryBackendAssets: (backendAssets: Record<string, FaderBackendAsset>) => void;
        /** Adds `storyAsset` to `scenes[sceneId]` by pushing to `.assetIds` and to `.assetOrderByGroup[storyAsset.group]` (creating an entry if the latter is missing) */
        storeAddFaderStoryAssetToScene: (storyAsset: FaderStoryAssetType, sceneId: FaderSceneType['id']) => void;
        storeUpdateFaderStoryAsset: (storyAsset: FaderStoryAssetType, sceneId: FaderSceneType['id']) => void;
        storeDeleteFaderStoryAsset: (storyAsset: FaderStoryAssetType, sceneId: FaderSceneType['id']) => void;
        storeAddLevaPanel: (levaPanel: LevaPanelOptions) => void;
        storeSetFaderLevaOptionsStore: (optionsStore: StoreType) => void;
    };
    fader: {
        faderStory: FaderStoryType | null;
        faderScenes: Record<string, FaderSceneType> | null;
        faderStoryBackendAssets: Record<string, FaderBackendAsset>;
        faderLevaPanels: LevaPanelOptions[];
        faderLevaOptionsStore: StoreType | null;
    };
}

export type LevaPanelOptions = { id: FaderStoryAssetType['id']; group: FaderAssetGroupType; store: StoreType };