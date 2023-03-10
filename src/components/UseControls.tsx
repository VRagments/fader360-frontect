import { useControls, folder, button } from 'leva';
import { FaderStoryAsset } from '../types/FaderTypes';

type UseControlsWrapperParams = {
    assetPropertiesRef: React.MutableRefObject<FaderStoryAsset['properties']>;
    assetDataRef: React.MutableRefObject<FaderStoryAsset['data']>;
};
export const useControlsWrapper = (params: UseControlsWrapperParams) => {
    const { assetPropertiesRef, assetDataRef } = params;

    /** - transient determines whether the component should refresh, we need it to, to update 3D position of the Textcard
     *  - onChange; "initial" : Is the the incoming value different from the value the leva "path" ('posVertical' for instance) was initialized with? There's also 'fromPanel' (was the value passed in from outside or not) */
    return useControls(() => ({
        Transforms: folder(
            {
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
            },
            { order: 0, color: 'yellow', collapsed: false }
        ),

        Content: folder(
            {
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
            },
            { order: 1, color: 'green', collapsed: true }
        ),

        Display: folder(
            {
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
                    { order: 0, color: 'blue', collapsed: true }
                ),
                Frame: folder(
                    {
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
                    },
                    { order: 1, color: 'pink', collapsed: true }
                ),
            },
            { order: 2, color: 'grey', collapsed: true }
        ),

        Asset: folder(
            {
                'Delete Asset': button(
                    (_get) => {
                        alert(`nothing going on here for now`);
                    },
                    { disabled: false }
                ),
            },
            { order: 3, color: 'purple', collapsed: true }
        ),
    }));
};
