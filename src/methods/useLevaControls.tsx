import { useControls, folder, button } from 'leva';
import { Schema, StoreType } from 'leva/dist/declarations/src/types';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { backgroundSphereGeometryArgs } from '../components/Background';
import { wrappers_DeleteAssetFromSceneStoreAndRemote, wrappers_UpdateSceneInLocalAndRemote } from '../lib/api_and_store_wrappers';
import useZustand from '../lib/zustand/zustand';
import { FaderBackendAsset, FaderSceneType, FaderStoryAssetType } from '../types/FaderTypes';
import { getSortedBackendAssetsByGroupType } from './faderHelpers';

type UseControlsWrapperParams = {
    asset: FaderStoryAssetType;
    assetPropertiesRef: React.MutableRefObject<FaderStoryAssetType['properties']>;
    assetDataRef: React.MutableRefObject<FaderStoryAssetType['data']>;
    store?: StoreType;
    scene?: FaderSceneType;
};
export const useControlsWrapper = (params: UseControlsWrapperParams) => {
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
                    min: -100, // for now, in order to handle minus values coming in from old backend.
                    max: 100,
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

const backgroundSphereRadius = backgroundSphereGeometryArgs![0] as number;

export const useControlsWrapperOptionsPanel = (store: StoreType, scene: FaderSceneType) => {
    const backendAssets = useZustand((state) => state.fader.faderStoryBackendAssets);
    const sortedBackendAssets = getSortedBackendAssetsByGroupType(backendAssets);

    const [enableBackground, setEnableBackground] = useState(scene.data.environment.preset !== '' ? true : false);
    const [backgroundSelectValue, setBackgroundSelectValue] = useState(scene.data.environment.preset);
    const [enableGround, setEnableGround] = useState(scene.data.environment.enableGroundIn360);
    const [groundYPos, setGroundYPos] = useState(scene.data.environment.positionY);

    const backgroundsFolderSchema = {
        enableBg: {
            label: 'Enable Background',
            value: enableBackground,
            onChange: (value: boolean) => {
                setEnableBackground(value);
            },
            transient: false,
        },
        Background: folder(
            {
                backgroundSelect: {
                    label: 'Available 360 Backgrounds',
                    options: [backgroundSelectValue],
                    onChange: (value: FaderBackendAsset['id']) => {
                        setBackgroundSelectValue(value);
                    },
                    transient: false,
                },
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
                    render: (get) => get('Scene Background.Background.enableGround') as boolean,
                },
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

    const environmentBackendAssetsKeyArray = Object.keys(sortedBackendAssets['360']);
    if (environmentBackendAssetsKeyArray.length) {
        // @ts-expect-error ...
        backgroundsFolderSchema.Background.schema.backgroundSelect.options = environmentBackendAssetsKeyArray.map(
            (envKey) => sortedBackendAssets['360'][envKey].id
        );
    }

    const levaOptionsSchema = {
        'Scene Background': folder(backgroundsFolderSchema as unknown as Schema),
    };

    const dependencies = [enableBackground, backgroundSelectValue, enableGround, groundYPos, backendAssets];

    const levaOptionsUseControls = useControls(() => levaOptionsSchema, { store }, dependencies);

    useEffect(() => {
        const updatedScene = cloneDeep(scene);
        updatedScene.data.environment.preset = enableBackground ? backgroundSelectValue : '';
        updatedScene.data.environment.enableGroundIn360 = enableGround;
        updatedScene.data.environment.positionY = groundYPos;

        wrappers_UpdateSceneInLocalAndRemote(updatedScene);
    }, dependencies);

    return levaOptionsUseControls;
};
