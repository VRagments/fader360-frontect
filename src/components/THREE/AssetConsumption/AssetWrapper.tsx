import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useCreateStore } from 'leva';
import { debounce } from 'lodash';
import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { Camera } from 'three';
import { wrappers_UpdateStoryAssetInStoreAndRemote } from '../../../lib/api_and_store_wrappers';
import useZustand from '../../../lib/zustand/zustand';
import { mergeHexAndOpacityValues } from '../../../lib/methods/colorHelpers';
import { convertTRS } from '../../../lib/methods/convertTRS';
import { useControlsWrapperAssetProperties } from '../../../lib/hooks/useLevaControls';
import { FaderBackendAsset, FaderSceneType, FaderSceneAssetType } from '../../../types/FaderTypes';
import { LevaPanelOptions } from '../../../types/ZustandTypes';

/** Factor by which to scale down the <Html> mesh representation, and then scale up the contained html elements (cheap AA trick) */
const scaleFactor = 2;

type AssetWrapperProps = {
    scene: FaderSceneType;
    asset: FaderSceneAssetType;
    backendAsset?: FaderBackendAsset;
    assetJsxElement: (params: AssetJsxElementParams) => JSX.Element;
    viewMode: boolean;
};
const AssetWrapper = ({ scene, asset, backendAsset, assetJsxElement, viewMode }: AssetWrapperProps) => {
    const cameraPos = useThree((state) => state.camera.position);
    const assetPropertiesRef = useRef<FaderSceneAssetType['properties']>(asset.properties);
    const assetDataRef = useRef<FaderSceneAssetType['data']>(asset.data);

    /* set initial Refs */
    useEffect(() => {
        assetPropertiesRef.current = asset.properties;
        assetDataRef.current = asset.data;
    }, []);

    const assetPropertiesState = useState(assetPropertiesRef.current);
    const [assetProperties] = assetPropertiesState;

    /* Memoize transform calculations, update on properties change */
    const convertedTRSMemoized = useMemo(() => convertTRSWrapper(assetProperties, cameraPos), [assetProperties, cameraPos]);

    return (
        <Html
            /* 'className' and 'style' affect the otherwise empty parent div, 'wrapperClass' affects the root div used for transforms: */
            key={asset.id}
            position={convertedTRSMemoized.positionConverted}
            rotation={convertedTRSMemoized.rotationConverted}
            scale={convertedTRSMemoized.scaleConverted.multiplyScalar(1 / scaleFactor)} /* see scaleFactor, Line 15 */
            transform
            zIndexRange={[19, 0]}
            occlude={false}
            className='box-content flex max-w-lg select-none flex-col content-center items-center overflow-hidden rounded-md p-2 text-center outline-none will-change-transform'
            wrapperClass=''
            style={{
                color: assetDataRef.current.textColor,
                backgroundColor: assetDataRef.current.backgroundOn
                    ? mergeHexAndOpacityValues(assetDataRef.current.backgroundColor, assetDataRef.current.backgroundOpacity)
                    : 'transparent',
                boxShadow: `0px 0px 0px 0.15rem ${mergeHexAndOpacityValues(
                    assetDataRef.current.frameColor,
                    assetDataRef.current.frameOpacity
                )}`,
                transform: `scale3d(${scaleFactor}, ${scaleFactor}, ${scaleFactor})`, // see scaleFactor, Line 15
            }}
        >
            {assetDataRef.current.headline && (
                <div
                    id={`panel headline ${asset.id}`}
                    className='bold mb-1 w-full rounded p-1 px-2 text-lg'
                    style={{
                        backgroundColor: assetDataRef.current.backgroundOn
                            ? mergeHexAndOpacityValues(assetDataRef.current.backgroundColor, assetDataRef.current.backgroundOpacity)
                            : 'transparent',
                    }}
                >
                    {assetDataRef.current.headline}
                </div>
            )}

            {assetJsxElement({ asset, assetDataRef, backendAsset })}

            {assetDataRef.current.body && (
                <div id={`panel body ${asset.id}`} className='whitespace-pre-wrap'>
                    {assetDataRef.current.body}
                </div>
            )}

            {!viewMode && <EditMode scene={scene} asset={asset} assetPropertiesState={assetPropertiesState} assetDataRef={assetDataRef} />}
        </Html>
    );
};

export default AssetWrapper;

type EditModePropsType = {
    scene: FaderSceneType;
    asset: FaderSceneAssetType;
    assetPropertiesState: [FaderSceneAssetType['properties'], React.Dispatch<React.SetStateAction<FaderSceneAssetType['properties']>>];
    assetDataRef: React.MutableRefObject<FaderSceneAssetType['data']>;
};

/** Loads Leva panel for indivual asset settings in Edit mode  */
const EditMode = (props: EditModePropsType) => {
    const { scene, asset, assetDataRef, assetPropertiesState } = props;
    const [assetProperties] = assetPropertiesState;

    const levaSingleAssetPanels = useZustand((state) => state.fader.faderLevaPanels);
    const { storeAddLevaPanel } = useZustand((state) => state.methods);

    const store = useCreateStore();
    useControlsWrapperAssetProperties({ asset, assetDataRef, store, scene, assetPropertiesState });

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
            data: { ...asset.data, ...assetDataRef.current },
        };

        return updatedStoryAssetData;
    }, [assetDataRef.current]);

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
    }, [assetDataRef.current]);

    return null;
};

export type AssetJsxElementParams = {
    asset: FaderSceneAssetType;
    backendAsset?: FaderBackendAsset;
    assetDataRef: React.MutableRefObject<FaderSceneAssetType['data']>;
};

/*
 * Functions
 */

/** Wrapper for converting old-school Fader transforms to THREE space */
function convertTRSWrapper(assetProperties: FaderSceneAssetType['properties'], cameraPos: Camera['position']) {
    const newTRS = convertTRS({
        position: {
            x: assetProperties.positionX,
            y: assetProperties.positionY,
            z: assetProperties.positionZ,
        },
        rotation: {
            x: assetProperties.rotationX,
            y: assetProperties.rotationY,
            z: assetProperties.rotationZ,
        },
        scale: {
            uniformScale: assetProperties.scale,
            x: assetProperties.scaleX,
            y: assetProperties.scaleY,
            z: assetProperties.scaleZ,
        },
        userPosition: { x: cameraPos.x, y: cameraPos.y, z: cameraPos.z },
    });

    return newTRS;
}

function containsObject(obj: LevaPanelOptions, arr: LevaPanelOptions[]) {
    return arr.some((elem) => elem.id === obj.id);
}
