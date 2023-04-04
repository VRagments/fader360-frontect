import { useEffect, useRef, useState } from 'react';
import { levaThemeValues } from '../../style/levaTheme';
import { FaderSceneType } from '../../types/FaderTypes';
import AssetPanel from './AssetPanel';
import SingleAssetPropertiesPanel from './SingleAssetPropertiesPanel';

type AssetUiProps = {
    currentScene: FaderSceneType | null;
};
const AssetUi = ({ currentScene }: AssetUiProps) => {
    const selectedAssetState = useState('');
    const [selectedAssetId] = selectedAssetState;

    const assetPanelParentRef = useRef<HTMLDivElement>(null);
    const [assetPanelParentRect, setAssetPanelParentRect] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (assetPanelParentRef.current) {
            const elemRect = assetPanelParentRef.current.getBoundingClientRect();
            setAssetPanelParentRect({ x: -elemRect.width - 10, y: elemRect.top - 10 }); // '10' is a hardcoded leva value
        }
    }, [currentScene, assetPanelParentRef.current]);

    if (!currentScene || !currentScene.id) {
        return null;
    }

    return (
        <>
            <div className='pointer-events-auto'>
                {selectedAssetId && (
                    <SingleAssetPropertiesPanel
                        selectedAssetState={selectedAssetState}
                        theme={levaThemeValues}
                        position={assetPanelParentRect}
                    />
                )}
            </div>

            <div
                ref={assetPanelParentRef}
                className='pointer-events-auto absolute right-0 top-0 z-10 m-2 flex min-h-0 w-1/4 overflow-hidden rounded-md bg-slate-500 bg-opacity-75 drop-shadow-2xl'
            >
                <AssetPanel currentScene={currentScene} selectedAssetState={selectedAssetState} theme={levaThemeValues} />
            </div>
        </>
    );
};

export default AssetUi;
