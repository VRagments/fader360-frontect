import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useCreateStore } from 'leva';
import { debounce } from 'lodash';
import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { Camera } from 'three';
import { wrappers_UpdateStoryAssetInStoreAndRemote } from '../../../lib/api_and_store_wrappers';
import useZustand from '../../../lib/zustand/zustand';
import { mergeHexAndOpacityValues } from '../../../lib/methods/colorHelpers';
import { convertTRS } from '../../../lib/methods/convertTRS';
import { useControlsWrapperAssetProperties } from '../../../lib/hooks/useLevaControls';
import { FaderBackendAsset, FaderSceneType, FaderSceneAssetType } from '../../../types/FaderTypes';
import { LevaPanelOptions } from '../../../types/ZustandTypes';

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
    const convertedTRSMemoized = useMemo(() => convertTRSMemoWrapper(assetProperties, cameraPos), [assetProperties, cameraPos]);

    return (
        <>
            <Html
                key={asset.id}
                position={convertedTRSMemoized.positionConverted}
                rotation={convertedTRSMemoized.rotationConverted}
                scale={convertedTRSMemoized.scaleConverted}
                transform
                // distanceFactor={10}
                occlude={false}
                zIndexRange={[10, 0]}
            >
                <div
                    id={asset.id}
                    className='fader-3d-card'
                    style={{
                        color: assetDataRef.current.textColor,
                        backgroundColor: assetDataRef.current.backgroundOn
                            ? mergeHexAndOpacityValues(assetDataRef.current.backgroundColor, assetDataRef.current.backgroundOpacity)
                            : 'transparent',
                        border: `2px ${assetDataRef.current.frameOn ? 'solid' : 'none'} ${mergeHexAndOpacityValues(
                            assetDataRef.current.frameColor,
                            assetDataRef.current.frameOpacity
                        )}`,
                    }}
                >
                    {assetDataRef.current.headline && (
                        <div
                            id={`${asset.id} headline`}
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
                    {assetDataRef.current.body && <div id={`${asset.id} body`}>{assetDataRef.current.body}</div>}
                </div>
            </Html>

            {!viewMode && <EditMode scene={scene} asset={asset} assetPropertiesState={assetPropertiesState} assetDataRef={assetDataRef} />}
        </>
    );
};

export default AssetWrapper;

type EditModePropsType = {
    scene: FaderSceneType;
    asset: FaderSceneAssetType;
    assetPropertiesState: [FaderSceneAssetType['properties'], React.Dispatch<React.SetStateAction<FaderSceneAssetType['properties']>>];
    assetDataRef: React.MutableRefObject<FaderSceneAssetType['data']>;
};
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

    const debouncedAddOrUpdateStoryAsset = useCallback((updatedStoryAsset: FaderSceneAssetType, debounceValueMs: number) => {
        const debounced = debounce(() => wrappers_UpdateStoryAssetInStoreAndRemote(updatedStoryAsset, scene), debounceValueMs);
        debounced();
    }, []);

    /* Longer debounce for changes in asset properties (as these are likely quickly changing TRS values) : */
    useEffect(() => {
        debouncedAddOrUpdateStoryAsset(updatedStoryAssetPropertiesMemo, 500);
    }, [updatedStoryAssetPropertiesMemo]);

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
function convertTRSMemoWrapper(assetProperties: FaderSceneAssetType['properties'], cameraPos: Camera['position']) {
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
