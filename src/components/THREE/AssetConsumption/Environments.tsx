import { FaderBackendAsset, FaderSceneType } from '../../../types/FaderTypes';
import AssetWrapper from './AssetWrapper';

/* TODO Expand to also use GLTF backgrounds */

type EnvironmentsProps = {
    scene: FaderSceneType;
    storyEnvironmentBackendAssets: Record<string, FaderBackendAsset>;
    viewMode: boolean;
};
const Environments = (props: EnvironmentsProps) => {
    const { scene, storyEnvironmentBackendAssets, viewMode } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['360'].map((environmentId, idx) => {
                const environmentAsset = scene.data.assets[environmentId];

                if (environmentAsset) {
                    const environmentBackendAsset = storyEnvironmentBackendAssets[environmentAsset.backendId];

                    return (
                        <AssetWrapper
                            key={`Environment ${environmentId} / ${idx}`}
                            scene={scene}
                            asset={environmentAsset}
                            backendAsset={environmentBackendAsset}
                            assetJsxElement={EnvironmentJsxElement}
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

export default Environments;

const EnvironmentJsxElement = () => {
    return <></>;
};
