import { FaderBackendAsset, FaderSceneType } from '../../../types/FaderTypes';
import AssetWrapper, { AssetJsxElementParams } from './AssetWrapper';

type SceneLinksProps = {
    scene: FaderSceneType;
    storySceneLinkBackendAssets: Record<string, FaderBackendAsset>;
    viewMode: boolean;
};
const SceneLinks = (props: SceneLinksProps) => {
    const { scene, storySceneLinkBackendAssets, viewMode } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['SceneLink'].map((sceneLinkId, idx) => {
                const sceneLinkAsset = scene.data.assets[sceneLinkId];

                if (sceneLinkAsset) {
                    const sceneLinkBackendAsset = storySceneLinkBackendAssets[sceneLinkAsset.backendId];

                    return (
                        <AssetWrapper
                            key={`SceneLink ${sceneLinkId} / ${idx}`}
                            scene={scene}
                            asset={sceneLinkAsset}
                            backendAsset={sceneLinkBackendAsset}
                            assetJsxElement={SceneLinkJsxElement}
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

export default SceneLinks;

const SceneLinkJsxElement = ({ backendAsset }: AssetJsxElementParams) => {
    if (!backendAsset) {
        return <></>;
    }

    return <div>SceneLink!</div>;
};
