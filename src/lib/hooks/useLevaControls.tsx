import { useControls, folder, button } from 'leva';
import { Schema, StoreType } from 'leva/dist/declarations/src/types';
import { useEffect, useMemo, useState } from 'react';
import {
    wrappers_DeleteAssetFromSceneStoreAndRemote,
    wrappers_SetStoryToStoreAndRemote,
    wrappers_UpdateSceneInLocalAndRemote,
    wrappers_UpdateStoryAssetInStoreAndRemote,
} from '../api_and_store_wrappers';
import { backgroundSphereGeometryArgs } from '../defaults';
import useZustand from '../zustand/zustand';
import { FaderBackendAsset, FaderSceneType, FaderSceneAssetType, FaderAssetGroupType } from '../../types/FaderTypes';
import { getBackendAssetsFromStoryAssetsByGroupType, getSortedBackendAssetsByType, setSceneOrderOfScene } from '../methods/faderHelpers';
import { groupAndTypeLinks } from '../createAsset';

type UseControlsWrapperAssetPropertiesParams = {
    asset: FaderSceneAssetType;
    assetPropertiesState: [FaderSceneAssetType['properties'], React.Dispatch<React.SetStateAction<FaderSceneAssetType['properties']>>];
    assetDataState: [FaderSceneAssetType['data'], React.Dispatch<React.SetStateAction<FaderSceneAssetType['data']>>];
    store?: StoreType;
    scene: FaderSceneType;
};
export const useControlsWrapperAssetProperties = (params: UseControlsWrapperAssetPropertiesParams) => {
    /** Instead of using setState and syncing to remote in a useEffect, the passed-in Refs are mutated (as they are 'watched'/synced in <Asset>) */
    const { asset, assetPropertiesState, assetDataState, store, scene } = params;
    const [assetData, setAssetData] = assetDataState;
    const [assetProperties, setAssetProperties] = assetPropertiesState;

    const faderScenes = useZustand((state) => state.fader.faderScenes);

    const sceneLinkOptions = useMemo(() => {
        if (faderScenes && scene) {
            const sceneLinkOptions: Record<FaderSceneType['name'], FaderSceneType['id']> = {};

            if (assetData.nextSceneId && assetData.nextSceneId !== 'none') {
                sceneLinkOptions[faderScenes[assetData.nextSceneId].name] = assetData.nextSceneId;
            }

            sceneLinkOptions['none'] = 'none';

            const otherScenes = Object.keys(faderScenes).filter(
                (faderSceneId) => faderSceneId !== scene.id && faderSceneId !== assetData.nextSceneId
            );
            otherScenes.forEach((otherScene) => {
                sceneLinkOptions[faderScenes[otherScene].name] = otherScene;
            });

            return sceneLinkOptions;
        } else {
            return { none: 'none' };
        }
    }, [faderScenes, scene]);

    const imageContent = {
        /* TODO this will need a custom plugin to display Files from a FaderStory's associated asset list (and also for audio/video/etc) */
        image: {
            label: 'Image',
            image: undefined,
            onChange: (_val: Blob, _path: string /*, { initial }: { initial: boolean } */) => {
                //
            },
            transient: false,
            disabled: true,
        },
    };

    const audioAndVideoContent = {
        autoPlay: {
            label: 'Autoplay',
            value: assetData.autoPlay,
            onChange: (val: boolean, _path: string, { initial }: { initial: boolean }) => {
                if (!initial) {
                    setAssetData({ ...assetData, autoPlay: val });
                }
            },
            transient: false,
        },
        loop: {
            label: 'Loop',
            value: assetData.loop,
            onChange: (val: boolean, _path: string, { initial }: { initial: boolean }) => {
                if (!initial) {
                    setAssetData({ ...assetData, loop: val });
                }
            },
            transient: false,
        },
    };

    let contentControls = {
        headline: {
            label: 'Headline',
            value: assetData.headline,
            onChange: (val: string, _path: string, { initial }: { initial: boolean }) => {
                if (!initial) {
                    setAssetData({ ...assetData, headline: val });
                }
            },
            transient: false,
        },
        body: {
            label: 'Body',
            value: assetData.body,
            rows: true,
            onChange: (val: string, _path: string, { initial }: { initial: boolean }) => {
                if (!initial) {
                    setAssetData({ ...assetData, body: val });
                }
            },
            transient: false,
        },
        textColor: {
            label: 'Text Color',
            value: assetData.textColor,
            onChange: (val: string, _path: string, { initial }: { initial: boolean }) => {
                if (!initial) {
                    setAssetData({ ...assetData, textColor: val });
                }
            },
            transient: false,
        },
    };

    const sceneLinkControls = {
        enableLink: {
            label: 'Interactive Link to another Scene',
            value: asset.group === 'SceneLink' ? true : false,
            onChange: (val: boolean, _path: string, { initial }: { initial: boolean }) => {
                if (!initial) {
                    let updatedAsset: FaderSceneAssetType;

                    if (val) {
                        setAssetData({ ...assetData, nextSceneId: 'none' });

                        updatedAsset = { ...asset, group: 'SceneLink', data: { ...assetData, nextSceneId: 'none' } };
                    } else {
                        const newGroupType = Object.keys(groupAndTypeLinks)[
                            Object.values(groupAndTypeLinks).findIndex((type) => type === asset.type)
                        ] as FaderAssetGroupType;

                        setAssetData({ ...assetData, nextSceneId: '' });

                        updatedAsset = {
                            ...asset,
                            group: newGroupType,
                            data: { ...assetData, nextSceneId: '' },
                        };
                    }

                    wrappers_UpdateStoryAssetInStoreAndRemote(updatedAsset, scene);
                }
            },
        },
        link: {
            label: 'Link to Scene',
            options: sceneLinkOptions,
            onChange: (val: string, _path: string, { initial }: { initial: boolean }) => {
                if (!initial) {
                    setAssetData({ ...assetData, nextSceneId: val });
                }
            },
            render: (get: (path: string) => boolean) => get('Content.enableLink'),
        },
    };

    const transformControls = {
        Position: folder(
            {
                posVertical: {
                    label: 'Vertical',
                    value: assetProperties.rotationX,
                    min: -180,
                    max: 180,
                    step: 0.5,
                    onChange: (val: number, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            setAssetProperties({ ...assetProperties, rotationX: val });
                        }
                    },
                    transient: false,
                },
                posHorizontal: {
                    label: 'Horizontal',
                    value: assetProperties.rotationY,
                    min: -180,
                    max: 180,
                    step: 0.5,
                    onChange: (val: number, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            setAssetProperties({ ...assetProperties, rotationY: val });
                        }
                    },
                    transient: false,
                },
                posDistance: {
                    label: 'Distance',
                    value: assetProperties.positionZ,
                    min: 0, // for now, in order to handle minus values coming in from old backend.
                    max: backgroundSphereGeometryArgs[0],
                    step: 1,
                    onChange: (val: number, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            setAssetProperties({ ...assetProperties, positionZ: val });
                        }
                    },
                    transient: false,
                },
            },
            { order: 0, collapsed: false }
        ),
        Rotation: folder(
            {
                rotTilt: {
                    label: 'Tilt',
                    value: assetProperties.rotationZ,
                    min: -180,
                    max: 180,
                    step: 0.5,
                    onChange: (val: number, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            setAssetProperties({ ...assetProperties, rotationZ: val });
                        }
                    },
                    transient: false,
                },
            },
            { order: 1, collapsed: false }
        ),
        Scale: folder(
            {
                scale: {
                    label: 'Scale',
                    value: assetProperties.scale,
                    min: 0.1, // for now, in order to handle minus values coming in from old backend.
                    max: 10,
                    step: 0.1,
                    onChange: (val: number, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            setAssetProperties({ ...assetProperties, scale: val });
                        }
                    },
                    transient: false,
                },
            },
            { order: 2, collapsed: false }
        ),
    };

    const displayControls = {
        Background: folder(
            {
                backgroundOn: {
                    label: 'Use Background',
                    value: assetData.backgroundOn,
                    onChange: (val: boolean, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            setAssetData({ ...assetData, backgroundOn: val });
                        }
                    },
                    transient: false,
                },
                backgroundColor: {
                    label: 'Background Color',
                    value: assetData.backgroundColor,
                    onChange: (val: string, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            setAssetData({ ...assetData, backgroundColor: val });
                        }
                    },
                    transient: false,
                },
                backgroundOpacity: {
                    label: 'Background Opacity',
                    value: assetData.backgroundOpacity,
                    min: 0,
                    max: 1,
                    step: 0.01,
                    onChange: (val: number, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            setAssetData({ ...assetData, backgroundOpacity: val });
                        }
                    },
                    transient: false,
                },
            },
            { order: 0, collapsed: true }
        ),
        Frame: folder(
            {
                frameOn: {
                    label: 'Use Frame',
                    value: assetData.frameOn,
                    onChange: (val: boolean, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            setAssetData({ ...assetData, frameOn: val });
                        }
                    },
                    transient: false,
                },
                frameColor: {
                    label: 'Frame Color',
                    value: assetData.frameColor,
                    onChange: (val: string, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            setAssetData({ ...assetData, frameColor: val });
                        }
                    },
                    transient: false,
                },
                frameOpacity: {
                    label: 'Frame Opacity',
                    value: assetData.frameOpacity,
                    min: 0,
                    max: 1,
                    step: 0.01,
                    onChange: (val: number, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            setAssetData({ ...assetData, frameOpacity: val });
                        }
                    },
                    transient: false,
                },
            },
            { order: 1, collapsed: true }
        ),
    };

    switch (asset.group) {
        case 'Image2D':
            contentControls = { ...contentControls, ...imageContent, ...sceneLinkControls };
            break;

        case 'TextCard':
            contentControls = { ...contentControls, ...sceneLinkControls };
            break;

        case 'SceneLink':
            contentControls = { ...contentControls, ...sceneLinkControls };
            break;

        case 'Audio':
            contentControls = { ...contentControls, ...audioAndVideoContent };
            break;

        case 'Video2D':
            contentControls = { ...contentControls, ...audioAndVideoContent };
            break;

        default:
            break;
    }

    const defaultControls = {
        // @ts-expect-error ...
        'Content': folder(contentControls, { order: 0, collapsed: false }),

        // 'SceneLink': folder(sceneLinkControls, { order: 1, collapsed: true }),

        'Display': folder(displayControls, { order: 2, collapsed: false }),

        'Transforms': folder(transformControls, { order: 3, collapsed: false }),

        'Delete Story Asset from Scene': folder(
            {
                'Delete Asset': button(
                    (_get) => {
                        if (scene) {
                            const alertResult = confirm(`Really delete ${asset.group} (${asset.id}) ?`);

                            if (alertResult) {
                                wrappers_DeleteAssetFromSceneStoreAndRemote(asset, scene);
                            }
                        }
                    },
                    { disabled: false }
                ),
            },
            { order: 4, collapsed: true }
        ),
    };

    return useControls(() => defaultControls, { store }, [assetProperties]);
};

const backgroundSphereRadius = backgroundSphereGeometryArgs[0];

export const useControlsWrapperSceneOptions = (store: StoreType, scene: FaderSceneType) => {
    const faderStory = useZustand((state) => state.fader.faderStory);

    const faderScenesOrder = faderStory!.data.sceneOrder;
    const currentScenePlaceInSceneOrder = faderScenesOrder.findIndex((sceneId) => sceneId === scene.id);
    if (currentScenePlaceInSceneOrder === -1) {
        throw new Error('Scene not found in Scene-Order!');
    }

    const backendAssets = useZustand((state) => state.fader.faderStoryBackendAssets);

    const namedEnvironmentBackendAssetIdRecord = useMemo(
        () =>
            generateRecordOfNamedBackendAssetIds({
                ...getSortedBackendAssetsByType(backendAssets)['Video'],
                ...getSortedBackendAssetsByType(backendAssets)['Image'],
            }),
        [backendAssets]
    );

    /* Get the absolute longest duration of an Asset attached to Scene: */
    const longestAudioAndVideoAssetDuration = useMemo(() => {
        const audioAndVideoBackendAssetsInScene = Object.values({
            ...getBackendAssetsFromStoryAssetsByGroupType('Audio', scene.data.assets, backendAssets),
            ...getBackendAssetsFromStoryAssetsByGroupType('Video2D', scene.data.assets, backendAssets),
        });

        /* Additionally, check if Scene Background is a video, and add to audioAndVideoBackendAssetsInScene */
        if (scene.data.environment.preset) {
            if (backendAssets[scene.data.environment.preset].media_type.includes('video')) {
                audioAndVideoBackendAssetsInScene.push(backendAssets[scene.data.environment.preset]);
            }
        }

        let longestDuration = 0;
        audioAndVideoBackendAssetsInScene.forEach((backendAsset) => {
            longestDuration = Math.max(longestDuration, backendAsset.attributes.duration);
        });

        return longestDuration;
    }, [scene, backendAssets]);

    /* defining useStates in an object to keep better tabs on dependencies to watch: */
    const allUseStates = {
        backgroundSelectValue: useState(scene.data.environment.preset),
        enableBackground: useState(scene.data.environment.preset !== '' ? true : false),
        enableGround: useState(scene.data.environment.enableGroundIn360),
        groundRadius: useState(scene.data.environment.radius),
        groundYPos: useState(scene.data.environment.positionY),
        enableGrid: useState(scene.data.enableGrid),
        sceneDuration: useState(scene.duration),
        sceneId: useState(scene.id),
        sceneName: useState(scene.name),
        sceneNavigatable: useState(scene.navigatable),
        scenesOrderIndex: useState(currentScenePlaceInSceneOrder),
    };

    /* define dependencies for Leva to watch: */
    const dependencies = Object.values(allUseStates).map((value) => value[0]);

    const {
        backgroundSelectValue: [backgroundSelectValue, setBackgroundSelectValue],
        enableBackground: [enableBackground, setEnableBackground],
        enableGround: [enableGround, setEnableGround],
        groundRadius: [groundRadius, setGroundRadius],
        groundYPos: [groundYPos, setGroundYPos],
        enableGrid: [enableGrid, setEnableGrid],
        sceneDuration: [sceneDuration, setSceneDuration],
        sceneId: [sceneId, setSceneId],
        sceneName: [sceneName, setSceneName],
        sceneNavigatable: [sceneNavigatable, setSceneNavigatable],
        scenesOrderIndex: [scenesOrderIndex, setScenesOrderIndex],
    } = allUseStates;

    /* Update stale states upon scene change (via <ScenePicker>, for instance): */
    useEffect(() => {
        setEnableBackground(scene.data.environment.preset !== '' ? true : false);
        setBackgroundSelectValue(scene.data.environment.preset);
        setEnableGround(scene.data.environment.enableGroundIn360);
        setGroundYPos(scene.data.environment.positionY);
        setGroundRadius(scene.data.environment.radius);
        setEnableGrid(scene.data.enableGrid);
        setSceneId(scene.id);
        setSceneDuration(scene.duration);
        setSceneName(scene.name);
        setSceneNavigatable(scene.navigatable);
        setScenesOrderIndex(currentScenePlaceInSceneOrder);
    }, [scene.id]);

    const sceneSettingsSchema = useMemo(() => {
        const schema = {
            sceneName: {
                label: 'Scene Name',
                value: sceneName,
                onChange: (value: FaderSceneType['name'], _path: string, { initial }: { initial: boolean }) => {
                    if (!initial) {
                        setSceneName(value);
                    }
                },
                transient: false,
            },
            sceneDuration: {
                label: 'Scene Duration',
                value: parseFloat(sceneDuration),
                step: 0.01,
                pad: 1,
                onChange: (value: number, _path: string, { initial }: { initial: boolean }) => {
                    if (!initial) {
                        if (value >= longestAudioAndVideoAssetDuration) {
                            setSceneDuration(value.toString());
                        } else {
                            // WARN silently sets sceneDuration to sensible value, only updates in Leva once it's re-opened
                            setSceneDuration(longestAudioAndVideoAssetDuration.toString());
                        }
                    }
                },
                transient: false,
            },
            sceneOrder: {
                label: 'Scene Order',
                value: scenesOrderIndex + 1 /* "human-readable" index starting at 1 */,
                min: 1,
                max: faderScenesOrder.length,
                step: 1,
                onChange: (value: number, _path: string, { initial }: { initial: boolean }) => {
                    if (!initial) {
                        setScenesOrderIndex(value - 1);
                    }
                },
                transient: false,
            },
            sceneNavigatable: {
                label: 'Navigatable?',
                hint: 'Can this Scene be jumped to?',
                value: sceneNavigatable,
                onChange: (value: FaderSceneType['navigatable'], _path: string, { initial }: { initial: boolean }) => {
                    if (!initial) {
                        setSceneNavigatable(value);
                    }
                },
                transient: false,
            },
            enableGrid: {
                label: 'Enable Grid',
                value: enableGrid,
                onChange: (value: boolean, _path: string, { initial }: { initial: boolean }) => {
                    if (!initial) {
                        setEnableGrid(value);
                    }
                },
                transient: false,
            },
            enableBg: {
                label: 'Enable Background',
                value: enableBackground,
                onChange: (value: boolean, _path: string, { initial }: { initial: boolean }) => {
                    if (!initial) {
                        setEnableBackground(value);
                    }
                },
                transient: false,
            },
            Background: folder(
                {
                    backgroundSelect: {
                        label: 'Available 360 Backgrounds',
                        options: namedEnvironmentBackendAssetIdRecord,
                        value: backgroundSelectValue,
                        onChange: (value: FaderBackendAsset['id'], _path: string, { initial }) => {
                            !initial && setBackgroundSelectValue(value);
                        },
                        transient: false,
                    },
                    enableGround: {
                        label: 'Enable Ground',
                        value: enableGround,
                        onChange: (val: boolean, _path: string, { initial }) => {
                            !initial && setEnableGround(val);
                        },
                        render: () =>
                            backgroundSelectValue && backendAssets[backgroundSelectValue].media_type.includes('video') ? false : true,
                    },
                    Ground: folder(
                        {
                            groundHeight: {
                                label: 'Ground Height',
                                value: groundYPos,
                                min: -backgroundSphereRadius,
                                max: backgroundSphereRadius,
                                step: 1,
                                onChange: (val: number, _path: string, { initial }) => {
                                    !initial && setGroundYPos(val);
                                },
                                transient: false,
                            },
                            groundRadius: {
                                label: 'Ground Radius',
                                value: groundRadius,
                                min: 0,
                                max: backgroundSphereRadius + 100,
                                onChange: (val: number, _path: string, { initial }) => {
                                    !initial && setGroundRadius(val);
                                },
                                transient: false,
                            },
                        },
                        {
                            collapsed: true,
                            render: (get) => get('Scene Settings.Background.enableGround') as boolean,
                        }
                    ),
                    Presets: folder(
                        {
                            presetSelect: {
                                label: '3D Presets',
                                options: { None: null },
                                disabled: true,
                            },
                        },
                        {
                            collapsed: true,
                        }
                    ),
                },
                {
                    render: (get) => get('Scene Settings.enableBg') as boolean,
                }
            ),
        };

        return schema;
    }, []);

    const levaSettingsSchema = {
        'Scene Settings': folder(sceneSettingsSchema as unknown as Schema, { collapsed: false }),
    };

    const levaOptionsUseControls = useControls(() => levaSettingsSchema, { store }, [sceneId]);

    /* Update Store/Remote loop: */
    useEffect(() => {
        /* Update properties in scene.data: */
        const updatedData = { ...scene.data };
        updatedData.enableGrid = enableGrid;

        /* Update properties in scene.data.environment: */
        const updatedEnvironment = { ...scene.data.environment };
        updatedEnvironment.preset = enableBackground ? backgroundSelectValue : '';
        updatedEnvironment.enableGroundIn360 = enableGround;
        updatedEnvironment.positionY = groundYPos;
        updatedEnvironment.radius = groundRadius;

        /* Update full scene: */
        const sceneUpdated = {
            ...scene,
            data: {
                ...updatedData,
                environment: updatedEnvironment,
            },
            duration: sceneDuration,
            name: sceneName,
            navigatable: sceneNavigatable,
        };

        wrappers_UpdateSceneInLocalAndRemote(sceneUpdated);

        /* Update any properties of FaderStory: */
        const newSceneOrder = setSceneOrderOfScene(faderScenesOrder, scene.id, scenesOrderIndex);

        wrappers_SetStoryToStoreAndRemote({
            ...faderStory!,
            data: {
                ...faderStory!.data,
                sceneOrder: newSceneOrder,
            },
        });
    }, dependencies);

    return levaOptionsUseControls;
};

export const generateRecordOfNamedBackendAssetIds = (backendAssets: Record<FaderBackendAsset['id'], FaderBackendAsset>) => {
    const recordOfNamedBackendAssetIds: Record<FaderBackendAsset['name'], FaderBackendAsset['id']> = {};

    for (const key in backendAssets) {
        const currentBackendAsset = backendAssets[key];

        recordOfNamedBackendAssetIds[currentBackendAsset.name] = currentBackendAsset.id;
    }

    return recordOfNamedBackendAssetIds;
};
