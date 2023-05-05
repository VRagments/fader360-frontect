import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useCreateStore } from 'leva';
import { debounce } from 'lodash';
import { useRef, useEffect, useMemo, useCallback } from 'react';
import { Camera } from 'three';
import { wrappers_UpdateStoryAssetInStoreAndRemote } from '../../lib/api_and_store_wrappers';
import useZustand from '../../lib/zustand/zustand';
import { mergeHexAndOpacityValues } from '../../methods/colorHelpers';
import { convertTRS } from '../../methods/convertTRS';
import { useControlsWrapperAssetProperties } from '../../methods/useLevaControls';
import { FaderBackendAsset, FaderSceneType, FaderSceneAssetType } from '../../types/FaderTypes';
import { LevaPanelOptions } from '../../types/ZustandTypes';

type AssetProps = {
    scene: FaderSceneType;
    asset: FaderSceneAssetType;
    backendAsset?: FaderBackendAsset;
    assetJsxElement: (params: AssetJsxElementParams) => JSX.Element;
};
const Asset = ({ scene, asset, backendAsset, assetJsxElement }: AssetProps) => {
    const cameraPos = useThree((state) => state.camera.position);
    const assetPropertiesRef = useRef<FaderSceneAssetType['properties']>(asset.properties);
    const assetDataRef = useRef<FaderSceneAssetType['data']>(asset.data);

    const levaSingleAssetPanels = useZustand((state) => state.fader.faderLevaPanels);

    const { storeAddLevaPanel } = useZustand((state) => state.methods);

    const store = useCreateStore();
    useControlsWrapperAssetProperties({ asset, assetPropertiesRef, assetDataRef, store, scene });

    /* set initial Refs & Leva panel */
    useEffect(() => {
        assetPropertiesRef.current = asset.properties;
        assetDataRef.current = asset.data;

        const levaSingleAssetPanelOptions = { id: asset.id, group: asset.group, store };
        if (containsObject(levaSingleAssetPanelOptions, levaSingleAssetPanels)) {
            storeAddLevaPanel(levaSingleAssetPanelOptions, true);
        } else {
            storeAddLevaPanel(levaSingleAssetPanelOptions);
        }
    }, []);

    /* Memoize transform calculations, update on properties change */
    const convertedTRSMemoized = useMemo(() => convertTRSMemoWrapper(assetPropertiesRef, cameraPos), [assetPropertiesRef.current]);

    /* <-- begin story asset edit routine (update store/remote from leva panel values) */
    let updatedStoryAsset = {
        ...asset,
        properties: { ...asset.properties, ...assetPropertiesRef.current },
        data: { ...asset.data, ...assetDataRef.current },
    };

    const debouncedAddOrUpdateStoryAsset = useCallback((updatedStoryAsset: FaderSceneAssetType) => {
        const debounced = debounce(() => wrappers_UpdateStoryAssetInStoreAndRemote(updatedStoryAsset, scene), 666);
        debounced();
    }, []);

    useEffect(() => {
        updatedStoryAsset = {
            ...asset,
            properties: { ...asset.properties, ...assetPropertiesRef.current },
            data: { ...asset.data, ...assetDataRef.current },
        };

        debouncedAddOrUpdateStoryAsset(updatedStoryAsset);
    }, [assetPropertiesRef.current, assetDataRef.current]);
    /* end --> */

    return (
        <Html
            key={asset.id}
            position={convertedTRSMemoized.positionConverted}
            rotation={convertedTRSMemoized.rotationConverted}
            scale={convertedTRSMemoized.scaleConverted}
            transform
            occlude={false}
            zIndexRange={[0, 1]}
        >
            <div
                id={asset.id}
                className={'fader-3d-card h-full w-full'}
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
    );
};

export default Asset;

export type AssetJsxElementParams = {
    asset: FaderSceneAssetType;
    backendAsset?: FaderBackendAsset;
    assetDataRef: React.MutableRefObject<FaderSceneAssetType['data']>;
};

/*
 * Functions
 */

/** Wrapper for converting old-school Fader transforms to THREE space */
function convertTRSMemoWrapper(
    assetPropertiesRef: React.MutableRefObject<FaderSceneAssetType['properties']>,
    cameraPos: Camera['position']
) {
    const currentRef = assetPropertiesRef.current;

    const newTRS = convertTRS({
        position: {
            x: currentRef.positionX,
            y: currentRef.positionY,
            z: currentRef.positionZ,
        },
        rotation: {
            x: currentRef.rotationX,
            y: currentRef.rotationY,
            z: currentRef.rotationZ,
        },
        scale: {
            uniformScale: currentRef.scale,
            x: currentRef.scaleX,
            y: currentRef.scaleY,
            z: currentRef.scaleZ,
        },
        userPosition: { x: cameraPos.x, y: cameraPos.y, z: cameraPos.z },
    });

    return newTRS;
}

function containsObject(obj: LevaPanelOptions, arr: LevaPanelOptions[]) {
    return arr.some((elem) => elem.id === obj.id);
}
