import { FaderBackendAsset, FaderSceneType } from '../../types/FaderTypes';
import Asset, { AssetJsxElementParams } from './Asset';

type SceneLinksProps = {
    scene: FaderSceneType;
    storySceneLinkBackendAssets: Record<string, FaderBackendAsset>;
};
const SceneLinks = (props: SceneLinksProps) => {
    const { scene, storySceneLinkBackendAssets } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['SceneLink'].map((sceneLinkId, idx) => {
                const sceneLinkAsset = scene.data.assets[sceneLinkId];

                if (sceneLinkAsset) {
                    const sceneLinkBackendAsset = storySceneLinkBackendAssets[sceneLinkAsset.backendId];

                    return (
                        <Asset
                            key={`SceneLink ${sceneLinkId} / ${idx}`}
                            scene={scene}
                            asset={sceneLinkAsset}
                            backendAsset={sceneLinkBackendAsset}
                            assetJsxElement={SceneLinkJsxElement}
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
