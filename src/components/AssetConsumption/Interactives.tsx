import { FaderBackendAsset, FaderSceneType } from '../../types/FaderTypes';
import { mergeHexAndOpacityValues } from '../../methods/colorHelpers';
import Asset, { AssetJsxElementParams } from './Asset';

type InteractivesProps = {
    scene: FaderSceneType;
    storyInteractiveBackendAssets: Record<string, FaderBackendAsset>;
};
const Interactives = (props: InteractivesProps) => {
    const { scene, storyInteractiveBackendAssets } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['Interactive'].map((interactiveId, idx) => {
                const interactiveAsset = scene.data.assets[interactiveId];

                if (interactiveAsset) {
                    const interactiveBackendAsset = storyInteractiveBackendAssets[interactiveAsset.backendId];

                    return (
                        <Asset
                            key={`Interactive ${interactiveId} / ${idx}`}
                            scene={scene}
                            asset={interactiveAsset}
                            backendAsset={interactiveBackendAsset}
                            assetJsxElement={InteractiveJsxElement}
                        />
                    );
                } else {
                    return null;
                }
            })}
        </>
    );
};

export default Interactives;

const InteractiveJsxElement = ({ asset, backendAsset, assetDataRef }: AssetJsxElementParams) => {
    if (!backendAsset) {
        return <></>;
    }

    return (
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
            <div
                className='bold mb-1 w-full rounded p-1 px-2 text-lg'
                style={{
                    backgroundColor: assetDataRef.current.backgroundOn
                        ? mergeHexAndOpacityValues(assetDataRef.current.backgroundColor, assetDataRef.current.backgroundOpacity)
                        : 'transparent',
                }}
            >
                {assetDataRef.current.headline}
            </div>
        </div>
    );
};
