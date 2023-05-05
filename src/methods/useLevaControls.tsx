import { useControls, folder, button } from 'leva';
import { Schema, StoreType } from 'leva/dist/declarations/src/types';
import { cloneDeep } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { wrappers_DeleteAssetFromSceneStoreAndRemote, wrappers_UpdateSceneInLocalAndRemote } from '../lib/api_and_store_wrappers';
import { backgroundSphereGeometryArgs } from '../lib/defaults';
import useZustand from '../lib/zustand/zustand';
import { FaderBackendAsset, FaderSceneType, FaderSceneAssetType } from '../types/FaderTypes';
import { getSortedBackendAssetsByType } from './faderHelpers';

type UseControlsWrapperAssetPropertiesParams = {
    asset: FaderSceneAssetType;
    assetPropertiesRef: React.MutableRefObject<FaderSceneAssetType['properties']>;
    assetDataRef: React.MutableRefObject<FaderSceneAssetType['data']>;
    store?: StoreType;
    scene?: FaderSceneType;
};
export const useControlsWrapperAssetProperties = (params: UseControlsWrapperAssetPropertiesParams) => {
    const { asset, assetPropertiesRef, assetDataRef, store, scene } = params;

    const textContent = {
        body: {
            label: 'Body',
            value: assetDataRef.current.body,
            rows: true,
            onChange: (val: string, _path: string, { initial }: { initial: boolean }) => {
                if (!initial) {
                    assetDataRef.current = { ...assetDataRef.current, body: val };
                }
            },
            transient: false,
        },
    };

    const imageContent = {
        /* TODO this will need a custom plugin to display Files from a FaderStory's associated asset list (and also for audio/video/etc) */
        image: {
            label: 'Image',
            image: undefined,
            onChange: (_val: Blob, _path: string /*, { initial }: { initial: boolean } */) => {
                //
            },
            transient: false,
        },
    };

    let contentControls = {
        headline: {
            label: 'Headline',
            value: assetDataRef.current.headline,
            onChange: (val: string, _path: string, { initial }: { initial: boolean }) => {
                if (!initial) {
                    assetDataRef.current = { ...assetDataRef.current, headline: val };
                }
            },
            transient: false,
        },
        textColor: {
            label: 'Text Color',
            value: assetDataRef.current.textColor,
            onChange: (val: string, _path: string, { initial }: { initial: boolean }) => {
                if (!initial) {
                    assetDataRef.current = { ...assetDataRef.current, textColor: val };
                }
            },
            transient: false,
        },
    };

    const transformControls = {
        Position: folder(
            {
                posVertical: {
                    label: 'Vertical',
                    value: assetPropertiesRef.current.rotationX,
                    min: -180,
                    max: 180,
                    step: 0.5,
                    onChange: (val: number, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            assetPropertiesRef.current = { ...assetPropertiesRef.current, rotationX: val };
                        }
                    },
                    transient: false,
                },
                posHorizontal: {
                    label: 'Horizontal',
                    value: assetPropertiesRef.current.rotationY,
                    min: -180,
                    max: 180,
                    step: 0.5,
                    onChange: (val: number, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            assetPropertiesRef.current = { ...assetPropertiesRef.current, rotationY: val };
                        }
                    },
                    transient: false,
                },
                posDistance: {
                    label: 'Distance',
                    value: assetPropertiesRef.current.positionZ,
                    min: 0, // for now, in order to handle minus values coming in from old backend.
                    max: backgroundSphereGeometryArgs[0],
                    step: 1,
                    onChange: (val: number, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            assetPropertiesRef.current = { ...assetPropertiesRef.current, positionZ: val };
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
                    value: assetPropertiesRef.current.rotationZ,
                    min: -180,
                    max: 180,
                    step: 0.5,
                    onChange: (val: number, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            assetPropertiesRef.current = { ...assetPropertiesRef.current, rotationZ: val };
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
                    value: assetPropertiesRef.current.scale,
                    min: 0.1, // for now, in order to handle minus values coming in from old backend.
                    max: 10,
                    step: 0.1,
                    onChange: (val: number, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            assetPropertiesRef.current = { ...assetPropertiesRef.current, scale: val };
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
                    value: assetDataRef.current.backgroundOn,
                    onChange: (val: boolean, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            assetDataRef.current = { ...assetDataRef.current, backgroundOn: val };
                        }
                    },
                    transient: false,
                },
                backgroundColor: {
                    label: 'Background Color',
                    value: assetDataRef.current.backgroundColor,
                    onChange: (val: string, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            assetDataRef.current = { ...assetDataRef.current, backgroundColor: val };
                        }
                    },
                    transient: false,
                },
                backgroundOpacity: {
                    label: 'Background Opacity',
                    value: assetDataRef.current.backgroundOpacity,
                    min: 0,
                    max: 1,
                    step: 0.01,
                    onChange: (val: number, _path: string, { initial }: { initial: boolean }) => {
                        if (!initial) {
                            assetDataRef.current = { ...assetDataRef.current, backgroundOpacity: val };
                        }
                    },
                    transient: false,
                },
            },
            { order: 0, collapsed: true }
        ),
        Frame: folder({
            frameOn: {
                label: 'Use Frame',
                value: assetDataRef.current.frameOn,
                onChange: (val: boolean, _path: string, { initial }: { initial: boolean }) => {
                    if (!initial) {
                        assetDataRef.current = { ...assetDataRef.current, frameOn: val };
                    }
                },
                transient: false,
            },
            frameColor: {
                label: 'Frame Color',
                value: assetDataRef.current.frameColor,
                onChange: (val: string, _path: string, { initial }: { initial: boolean }) => {
                    if (!initial) {
                        assetDataRef.current = { ...assetDataRef.current, frameColor: val };
                    }
                },
                transient: false,
            },
            frameOpacity: {
                label: 'Frame Opacity',
                value: assetDataRef.current.frameOpacity,
                min: 0,
                max: 1,
                step: 0.01,
                onChange: (val: number, _path: string, { initial }: { initial: boolean }) => {
                    if (!initial) {
                        assetDataRef.current = { ...assetDataRef.current, frameOpacity: val };
                    }
                },
                transient: false,
            },
        }),
    };

    if (asset.group == 'Image2D') {
        contentControls = { ...contentControls, ...imageContent };
    } else {
        contentControls = { ...contentControls, ...textContent };
    }

    let defaultControls = {
        // @ts-expect-error ...
        'Content': folder(contentControls, { order: 0, collapsed: false }),

        'Display': folder(displayControls, { order: 1, collapsed: true }),

        'Transforms': folder(transformControls, { order: 2, collapsed: false }),

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
            { order: 3, collapsed: true }
        ),
    };

    if (asset.group == '360') {
        const { Content: _ignored_Content, Display: _ignored_Display, ...rest } = defaultControls;

        // @ts-expect-error ...
        defaultControls = rest;
    }

    return useControls(() => defaultControls, { store });
};

const backgroundSphereRadius = backgroundSphereGeometryArgs[0];

export const useControlsWrapperOptionsPanel = (store: StoreType, scene: FaderSceneType) => {
    const backendAssets = useZustand((state) => state.fader.faderStoryBackendAssets);
    const namedEnvironmentBackendAssetIdRecord = useMemo(
        () =>
            generateNamedBackendAssetIdRecord({
                ...getSortedBackendAssetsByType(backendAssets)['Video'],
                ...getSortedBackendAssetsByType(backendAssets)['Image'],
            }),
        [backendAssets]
    );

    const [sceneId, setSceneId] = useState(scene.id);
    const [enableBackground, setEnableBackground] = useState(scene.data.environment.preset !== '' ? true : false);
    const [backgroundSelectValue, setBackgroundSelectValue] = useState(scene.data.environment.preset);
    const [enableGround, setEnableGround] = useState(scene.data.environment.enableGroundIn360);
    const [groundYPos, setGroundYPos] = useState(scene.data.environment.positionY);
    const [groundRadius, setGroundRadius] = useState(scene.data.environment.radius);

    /* Update stale states upon scene change (via <ScenePicker>, for instance): */
    useEffect(() => {
        setSceneId(scene.id);
        setEnableBackground(scene.data.environment.preset !== '' ? true : false);
        setBackgroundSelectValue(scene.data.environment.preset);
        setEnableGround(scene.data.environment.enableGroundIn360);
        setGroundYPos(scene.data.environment.positionY);
        setGroundRadius(scene.data.environment.radius);
    }, [scene.id]);

    const dependencies = [enableBackground, backgroundSelectValue, enableGround, groundYPos, groundRadius, backendAssets];

    const backgroundsFolderSchema = useMemo(() => {
        const schema = {
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
                        onChange: (value: FaderBackendAsset['id'], _path, { initial }) => {
                            if (!initial) {
                                setBackgroundSelectValue(value);
                            }
                        },
                        transient: false,
                    },
                    Ground: folder(
                        {
                            enableGround: {
                                label: 'Enable Ground',
                                value: enableGround,
                                onChange: (val: boolean, _path, { initial }) => {
                                    !initial && setEnableGround(val);
                                },
                            },
                            groundHeight: {
                                label: 'Ground Height',
                                value: groundYPos,
                                min: -backgroundSphereRadius,
                                max: backgroundSphereRadius,
                                step: 1,
                                onChange: (val: number, _path, { initial }) => {
                                    !initial && setGroundYPos(val);
                                },
                                transient: false,
                            },
                            groundRadius: {
                                label: 'Ground Radius',
                                value: groundRadius,
                                min: 0,
                                max: backgroundSphereRadius + 100,
                                onChange: (val: number, _path, { initial }) => {
                                    !initial && setGroundRadius(val);
                                },
                                transient: false,
                            },
                        },
                        {
                            render: (get) => {
                                const levaBackgroundSelectValue = get('Scene Background.Background.backgroundSelect') as string;
                                const levaBackgroundSelectedBackendAsset = backendAssets[levaBackgroundSelectValue];

                                if (!levaBackgroundSelectedBackendAsset) {
                                    return false;
                                } else {
                                    if (levaBackgroundSelectedBackendAsset.media_type.includes('video')) {
                                        return false;
                                    } else {
                                        return true;
                                    }
                                }
                            },
                        }
                    ),
                },
                {
                    render: (get) => get('Scene Background.enableBg') as boolean,
                }
            ),
            Preset: folder({
                presetSelect: {
                    label: '3D Presets',
                    options: { None: null },
                    disabled: true,
                    render: (get) => get('Scene Background.enableBg') as boolean,
                },
            }),
        };

        return schema;
    }, dependencies);

    const levaOptionsSchema = {
        'Scene Background': folder(backgroundsFolderSchema as unknown as Schema),
    };

    const levaOptionsUseControls = useControls(() => levaOptionsSchema, { store }, [sceneId]);

    useEffect(() => {
        const updatedScene = cloneDeep(scene);
        updatedScene.data.environment.preset = enableBackground ? backgroundSelectValue : '';
        updatedScene.data.environment.enableGroundIn360 = enableGround;
        updatedScene.data.environment.positionY = groundYPos;
        updatedScene.data.environment.radius = groundRadius;

        wrappers_UpdateSceneInLocalAndRemote(updatedScene);
    }, dependencies);

    return levaOptionsUseControls;
};

export const generateNamedBackendAssetIdRecord = (backendAssets: Record<FaderBackendAsset['id'], FaderBackendAsset>) => {
    const recordNameAsset: Record<FaderBackendAsset['name'], FaderBackendAsset['id']> = {};

    for (const key in backendAssets) {
        const currentBackendAsset = backendAssets[key];

        recordNameAsset[currentBackendAsset.name] = currentBackendAsset.id;
    }

    return recordNameAsset;
};
