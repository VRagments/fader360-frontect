import { StoreType } from 'leva/dist/declarations/src/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ZustandState } from '../../types/ZustandTypes';

/* TODO Prepare repo for production / dev environments respectively?
 * const useZustand = process.env.NODE_ENV === 'production' ? create(createState) : create(log(createState)) */

/** Our Store */
const useZustand = create<ZustandState>()(
    devtools(
        immer((set, _get) => {
            const initialState: ZustandState = {
                methods: {
                    storeSetCurrentSceneId: (scene_id) => {
                        set((draftState) => {
                            draftState.fader.currentFaderSceneId = scene_id;
                        });
                    },
                    storeSetFaderStory: (story) => {
                        set(
                            (draftState) => {
                                draftState.fader.faderStory = story;
                            },
                            false,
                            'storeSetFaderStory'
                        );
                    },
                    storeSetFaderScenes: (scenes) => {
                        set(
                            (draftState) => {
                                draftState.fader.faderScenes = scenes;
                            },
                            false,
                            'storeSetFaderScenes'
                        );
                    },
                    storeUpdateFaderScene: (scene) => {
                        set((draftState) => {
                            if (draftState.fader.faderScenes) {
                                draftState.fader.faderScenes[scene.id] = scene;
                            }
                        });
                    },
                    storeUpdateFaderSceneData: (sceneId, sceneData) => {
                        set((draftState) => {
                            if (draftState.fader.faderScenes) {
                                draftState.fader.faderScenes[sceneId].data = { ...sceneData };
                            }
                        });
                    },
                    storeSetFaderStoryBackendAssets: (backendAssets) => {
                        set(
                            (draftState) => {
                                draftState.fader.faderStoryBackendAssets = backendAssets;
                            },
                            false,
                            'storeSetFaderStoryBackendAssets'
                        );
                    },

                    storeAddFaderStoryAssetToScene: (storyAsset, sceneId) => {
                        set(
                            (draftState) => {
                                if (draftState.fader.faderStory && draftState.fader.faderScenes) {
                                    draftState.fader.faderScenes[sceneId].data.assetIds.push(storyAsset.id);
                                    draftState.fader.faderScenes[sceneId].data.assetOrderByGroup[storyAsset.group]?.push(storyAsset.id);
                                    draftState.fader.faderScenes[sceneId].data.assets[storyAsset.id] = storyAsset;
                                }
                            },
                            false,
                            'storeAddFaderStoryAssetToScene'
                        );
                    },
                    storeUpdateFaderStoryAsset: (storyAsset, sceneId) => {
                        set(
                            (draftState) => {
                                const draftFaderStoryAsset = draftState.fader.faderScenes![sceneId].data.assets[storyAsset.id];

                                draftState.fader.faderScenes![sceneId].data.assets[storyAsset.id] = {
                                    ...draftFaderStoryAsset,
                                    ...storyAsset,
                                };
                            },
                            false,
                            'storeUpdateFaderStoryAsset'
                        );
                    },
                    storeDeleteFaderStoryAsset: (storyAsset, sceneId) => {
                        set(
                            (draftState) => {
                                const draftScene = draftState.fader.faderScenes![sceneId];

                                /* Remove from scene.data.assetIds */
                                const assetIndexInAssetIds = draftScene.data.assetIds.indexOf(storyAsset.id);
                                draftScene.data.assetIds.splice(assetIndexInAssetIds, 1);

                                /* Remove from scene.data.assetOrderByGroup */
                                const assetIndexInGroupOrder = draftScene.data.assetOrderByGroup[storyAsset.group].indexOf(storyAsset.id);
                                draftScene.data.assetOrderByGroup[storyAsset.group]!.splice(assetIndexInGroupOrder, 1);

                                /* Remove from project.data.assets */
                                delete draftScene.data.assets[storyAsset.id];
                            },
                            false,
                            'storeDeleteFaderStoryAsset'
                        );
                    },
                    storeAddLevaPanel: (levaPanel, replace = false) => {
                        set(
                            (draftState) => {
                                const draftFaderLevaPanels = draftState.fader.faderLevaPanels;

                                if (replace) {
                                    for (let i = 0; i <= draftFaderLevaPanels.length; i++) {
                                        if (levaPanel.id == draftFaderLevaPanels[i].id) {
                                            draftFaderLevaPanels.splice(i, 1, levaPanel);
                                            break;
                                        }
                                    }
                                } else {
                                    draftFaderLevaPanels.push(levaPanel);
                                }
                            },
                            false,
                            'storeAddLevaPanel'
                        );
                    },
                    storeSetFaderLevaOptionsStore: (optionsStore: StoreType) => {
                        set(
                            (draftState) => {
                                draftState.fader.faderLevaOptionsStore = optionsStore;
                            },
                            false,
                            'storeSetFaderLevaOptionsStore'
                        );
                    },
                },
                siteData: {
                    // TODO unused
                },
                fader: {
                    faderStory: null,
                    faderScenes: null,
                    currentFaderSceneId: '',
                    faderStoryBackendAssets: {},
                    faderLevaPanels: [],
                    faderLevaOptionsStore: null,
                },
            };

            return initialState;
        })
    )
);

export default useZustand;
