import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useCreateStore } from 'leva';
import { debounce } from 'lodash';
import { useRef, useEffect, useMemo, useCallback } from 'react';
import { Camera } from 'three';
import { wrappers_UpdateStoryAssetInStoreAndRemote } from '../../lib/api_and_store_wrappers';
import useZustand from '../../lib/zustand/zustand';
import { convertTRS } from '../../methods/convertTRS';
import { useControlsWrapper } from '../../methods/useLevaControls';
import { FaderBackendAsset, FaderSceneType, FaderStoryAssetType } from '../../types/FaderTypes';
import { LevaPanelOptions } from '../../types/ZustandTypes';

type AssetProps = {
    scene: FaderSceneType;
    asset: FaderStoryAssetType;
    backendAsset?: FaderBackendAsset;
    assetJsxElement: (params: AssetJsxElementParams) => JSX.Element;
};
const Asset = ({ scene, asset, backendAsset, assetJsxElement }: AssetProps) => {
    const cameraPos = useThree((state) => state.camera.position);
    const assetPropertiesRef = useRef<FaderStoryAssetType['properties']>(asset.properties);
    const assetDataRef = useRef<FaderStoryAssetType['data']>(asset.data);

    const levaPanels = useZustand((state) => state.fader.faderLevaPanels);

    const { storeAddLevaPanel } = useZustand((state) => state.methods);

    const store = useCreateStore();
    useControlsWrapper({ asset, assetPropertiesRef, assetDataRef, store, scene });

    /* set initial Refs & Leva panel */
    useEffect(() => {
        assetPropertiesRef.current = asset.properties;
        assetDataRef.current = asset.data;

        const levaPanelOptions = { id: asset.id, group: asset.group, store };
        if (!containsObject(levaPanelOptions, levaPanels)) {
            storeAddLevaPanel(levaPanelOptions);
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

    const debouncedAddOrUpdateStoryAsset = useCallback((updatedStoryAsset: FaderStoryAssetType) => {
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
            {assetJsxElement({ asset, assetDataRef, backendAsset })}
        </Html>
    );
};

export default Asset;

export type AssetJsxElementParams = {
    asset: FaderStoryAssetType;
    backendAsset?: FaderBackendAsset;
    assetDataRef: React.MutableRefObject<FaderStoryAssetType['data']>;
};

/*
 * Functions
 */

/** Wrapper for converting old-school Fader transforms to THREE space */
function convertTRSMemoWrapper(
    assetPropertiesRef: React.MutableRefObject<FaderStoryAssetType['properties']>,
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
