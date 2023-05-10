import { defaultCardHeight, defaultCardWidth } from '../../../lib/defaults';
import { FaderBackendAsset, FaderSceneType } from '../../../types/FaderTypes';
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
