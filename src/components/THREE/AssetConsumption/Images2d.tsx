import { defaultCardHeight, defaultCardWidth } from '../../../lib/defaults';
import { FaderBackendAsset, FaderSceneType } from '../../../types/FaderTypes';
import AssetWrapper, { AssetJsxElementParams } from './AssetWrapper';

type Images2dProps = {
    scene: FaderSceneType;
    storyImage2dBackendAssets: Record<string, FaderBackendAsset>;
    viewMode: boolean;
};
const Images2d = (props: Images2dProps) => {
    const { scene, storyImage2dBackendAssets, viewMode } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['Image2D'].map((image2dId, idx) => {
                const image2dAsset = scene.data.assets[image2dId];

                if (image2dAsset) {
                    const image2dBackendAsset = storyImage2dBackendAssets[image2dAsset.backendId];

                    return (
                        <AssetWrapper
                            key={`Image2D ${image2dId} / ${idx}`}
                            scene={scene}
                            asset={image2dAsset}
                            backendAsset={image2dBackendAsset}
                            assetJsxElement={Image2dJsxElement}
                            viewMode={viewMode}
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

const Image2dJsxElement = ({ backendAsset }: AssetJsxElementParams) => {
    if (!backendAsset) {
        return <></>;
    }

    return (
        <img
            src={backendAsset.static_url}
            width={Math.min(backendAsset.attributes.width, defaultCardWidth)}
            height={Math.min(backendAsset.attributes.height, defaultCardHeight)}
        />
    );
};
