import { FaderBackendAsset, FaderSceneType } from '../../../types/FaderTypes';
import Asset from './Asset';

/* TODO Expand to also use GLTF backgrounds */

type EnvironmentsProps = {
    scene: FaderSceneType;
    storyEnvironmentBackendAssets: Record<string, FaderBackendAsset>;
};
const Environments = (props: EnvironmentsProps) => {
    const { scene, storyEnvironmentBackendAssets } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['360'].map((environmentId, idx) => {
                const environmentAsset = scene.data.assets[environmentId];

                if (environmentAsset) {
                    const environmentBackendAsset = storyEnvironmentBackendAssets[environmentAsset.backendId];

                    return (
                        <Asset
                            key={`Environment ${environmentId} / ${idx}`}
                            scene={scene}
                            asset={environmentAsset}
                            backendAsset={environmentBackendAsset}
                            assetJsxElement={EnvironmentJsxElement}
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
