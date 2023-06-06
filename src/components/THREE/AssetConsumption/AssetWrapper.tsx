import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useCreateStore } from 'leva';
import { debounce } from 'lodash';
import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { wrappers_UpdateStoryAssetInStoreAndRemote } from '../../../lib/api_and_store_wrappers';
import useZustand from '../../../lib/zustand/zustand';
import { mergeHexAndOpacityValues } from '../../../lib/methods/colorHelpers';
import { convertTRSWrapper } from '../../../lib/methods/convertTRS';
import { useControlsWrapperAssetProperties } from '../../../lib/hooks/useLevaControls';
import { FaderBackendAsset, FaderSceneType, FaderSceneAssetType } from '../../../types/FaderTypes';
import { LevaPanelOptions } from '../../../types/ZustandTypes';

/** Factor by which to scale down the <Html> mesh representation, and then scale up the contained html elements (cheap AA trick) */
const scaleFactor = 2;

type AssetWrapperProps = {
    scene: FaderSceneType;
    asset: FaderSceneAssetType;
    backendAsset?: FaderBackendAsset;
    assetJsxElement: (params: AssetJsxElementProps) => JSX.Element;
    userRootElement?: {
        additionalClassNames: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClickCallback: (...args: any[]) => void;
    };
    viewMode: boolean;
};
const AssetWrapper = (props: AssetWrapperProps) => {
    const {
        scene,
        asset,
        backendAsset,
        assetJsxElement,
        userRootElement = {
            additionalClassNames: '',
            onClickCallback: () => null,
        },
        viewMode,
    } = props;
    const { additionalClassNames, onClickCallback } = userRootElement;

    const cameraPos = useThree((state) => state.camera.position);
    const assetPropertiesRef = useRef<FaderSceneAssetType['properties']>(asset.properties);
    const assetDataRef = useRef<FaderSceneAssetType['data']>(asset.data);

    /* set initial Refs */
    useEffect(() => {
        assetPropertiesRef.current = asset.properties;
        assetDataRef.current = asset.data;
    }, []);

    const assetDataState = useState(assetDataRef.current);
    const [assetData] = assetDataState;
    const assetPropertiesState = useState(assetPropertiesRef.current);
    const [assetProperties] = assetPropertiesState;

    /* Memoize transform calculations, update on properties change */
    const convertedTRSMemoized = useMemo(() => convertTRSWrapper(assetProperties, cameraPos), [assetProperties, cameraPos]);

    return (
        <Html
            /* 'className' and 'style' affect the otherwise empty direct parent div, 'wrapperClass' affects the root div used for transforms: */
            key={asset.id}
            position={convertedTRSMemoized.positionConverted}
            rotation={convertedTRSMemoized.rotationConverted}
            scale={convertedTRSMemoized.scaleConverted.multiplyScalar(1 / scaleFactor)} /* see scaleFactor, Line 15 */
            transform
            zIndexRange={[19, 0]}
            occlude={false}
            className={'group'}
            style={{
                transform: `scale3d(${scaleFactor}, ${scaleFactor}, ${scaleFactor})`, // see scaleFactor, Line 15
            }}
        >
            <div
                id={`userRoot Element of Html 'Panel': ${asset.group} (${asset.type}) - asset name: ${assetData.name} - asset id: ${
                    asset.id
                } ${backendAsset && ` - backendAsset id: ${backendAsset.id}`}`}
                className={
                    'box-content flex max-h-fit max-w-lg cursor-pointer select-none flex-col items-center justify-between overflow-hidden rounded-md p-2 text-center outline-none will-change-transform ' +
                    additionalClassNames
                }
                onClick={(ev) => {
                    onClickCallback(ev);
                }}
                style={{
                    color: assetData.textColor,
                    backgroundColor: assetData.backgroundOn
                        ? mergeHexAndOpacityValues(assetData.backgroundColor, assetData.backgroundOpacity)
                        : 'transparent',
                    boxShadow: `0px 0px 0px 0.15rem ${mergeHexAndOpacityValues(assetData.frameColor, assetData.frameOpacity)}`,
                }}
            >
                {assetData.headline && (
                    <div
                        id={`panel headline ${asset.id}`}
                        className='bold mb-1 w-auto rounded p-1 px-2 text-lg'
                        style={{
                            backgroundColor: assetData.backgroundOn
                                ? mergeHexAndOpacityValues(assetData.backgroundColor, assetData.backgroundOpacity)
                                : 'transparent',
                        }}
                    >
                        {assetData.headline}
                    </div>
                )}

                {assetJsxElement({ asset, assetDataRef, backendAsset, viewMode })}

                {assetData.body && (
                    <div id={`panel body ${asset.id}`} className='whitespace-pre-wrap'>
                        {assetData.body}
                    </div>
                )}

                {!viewMode && (
                    <EditMode scene={scene} asset={asset} assetPropertiesState={assetPropertiesState} assetDataState={assetDataState} />
                )}
            </div>
        </Html>
    );
};

export default AssetWrapper;

type EditModePropsType = {
    scene: FaderSceneType;
    asset: FaderSceneAssetType;
    assetPropertiesState: [FaderSceneAssetType['properties'], React.Dispatch<React.SetStateAction<FaderSceneAssetType['properties']>>];
    assetDataState: [FaderSceneAssetType['data'], React.Dispatch<React.SetStateAction<FaderSceneAssetType['data']>>];
};

/** Loads Leva panel for indivual asset settings in Edit mode  */
const EditMode = (props: EditModePropsType) => {
    const { scene, asset, assetPropertiesState, assetDataState } = props;
    const [assetData] = assetDataState;
    const [assetProperties] = assetPropertiesState;

    const levaSingleAssetPanels = useZustand((state) => state.fader.faderLevaPanels);
    const { storeAddLevaPanel } = useZustand((state) => state.methods);

    const store = useCreateStore();
    useControlsWrapperAssetProperties({ asset, store, scene, assetPropertiesState, assetDataState });

    /* set Leva panel */
    useEffect(() => {
        const levaSingleAssetPanelOptions = { id: asset.id, group: asset.group, store };
        if (containsObject(levaSingleAssetPanelOptions, levaSingleAssetPanels)) {
            storeAddLevaPanel(levaSingleAssetPanelOptions, true);
        } else {
            storeAddLevaPanel(levaSingleAssetPanelOptions);
        }
    }, []);

    const updatedStoryAssetPropertiesMemo = useMemo(() => {
        const updatedStoryAssetProperties = {
            ...asset,
            properties: assetProperties,
        };

        return updatedStoryAssetProperties;
    }, [assetProperties]);

    const updatedStoryAssetDataMemo = useMemo(() => {
        const updatedStoryAssetData = {
            ...asset,
            data: { ...asset.data, ...assetData },
        };

        return updatedStoryAssetData;
    }, [assetData]);

    /** Updates Story Asset after a 'debounced' amount of Milliseconds: */
    const debouncedAddOrUpdateStoryAsset = useCallback((updatedStoryAsset: FaderSceneAssetType, debounceValueMs: number) => {
        // TODO Would it make sense to only debounce remote calls and instantly set changes to local store? Will we stay in sync?
        const debounced = debounce(() => wrappers_UpdateStoryAssetInStoreAndRemote(updatedStoryAsset, scene), debounceValueMs);
        debounced();
    }, []);

    /* Longer debounce for changes in asset properties (as these are likely quickly changing TRS values): */
    useEffect(() => {
        debouncedAddOrUpdateStoryAsset(updatedStoryAssetPropertiesMemo, 500);
    }, [updatedStoryAssetPropertiesMemo]);

    /* Headline text, Frame/BG colors etc: */
    useEffect(() => {
        debouncedAddOrUpdateStoryAsset(updatedStoryAssetDataMemo, 150);
    }, [updatedStoryAssetDataMemo]);

    return null;
};

export type AssetJsxElementProps = {
    asset?: FaderSceneAssetType;
    backendAsset?: FaderBackendAsset;
    assetDataRef?: React.MutableRefObject<FaderSceneAssetType['data']>;
    viewMode?: boolean;
};

/*
 * Functions
 */


function containsObject(obj: LevaPanelOptions, arr: LevaPanelOptions[]) {
    return arr.some((elem) => elem.id === obj.id);
}
