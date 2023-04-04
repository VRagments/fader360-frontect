import { FaderBackendAsset, FaderSceneType } from '../../types/FaderTypes';
import { mergeHexAndOpacityValues } from '../../methods/colorHelpers';
import Asset, { AssetJsxElementParams } from './Asset';

type Images2dProps = {
    scene: FaderSceneType;
    storyImage2dBackendAssets: Record<string, FaderBackendAsset>;
};
const Images2d = (props: Images2dProps) => {
    const { scene, storyImage2dBackendAssets } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['Image2D'].map((image2dId, idx) => {
                const image2dAsset = scene.data.assets[image2dId];

                if (image2dAsset) {
                    const image2dBackendAsset = storyImage2dBackendAssets[image2dAsset.backendId];

                    return (
                        <Asset
                            key={`Image2D ${image2dId} / ${idx}`}
                            scene={scene}
                            asset={image2dAsset}
                            backendAsset={image2dBackendAsset}
                            assetJsxElement={Image2dJsxElement}
                        />
                    );
                } else {
                    return null;
                }
            })}
        </>
    );
};

export default Images2d;

const Image2dJsxElement = ({ asset, backendAsset, assetDataRef }: AssetJsxElementParams) => {
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
            <img
                src={backendAsset.static_url}
                style={{ width: `${backendAsset.attributes.width}px`, height: `${backendAsset.attributes.height}px` }}
            />
        </div>
    );
};
