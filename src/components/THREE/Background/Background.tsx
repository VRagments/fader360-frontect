import { isUUID } from '../../../lib/helpers';
import { FaderBackendAsset, FaderSceneDataType } from '../../../types/FaderTypes';
import BackgroundImageDome from './BackgroundImageDome';
import BackgroundVideoDome from './BackgroundVideoDome';

type BackgroundProps = {
    scene360BackendAssets: Record<string, FaderBackendAsset>;
    backgroundEnvironment: FaderSceneDataType['environment'];
};
const Background = (props: BackgroundProps) => {
    const { scene360BackendAssets, backgroundEnvironment } = props;

    if (isUUID(backgroundEnvironment.preset)) {
        if (scene360BackendAssets[backgroundEnvironment.preset].media_type.includes('video')) {
            return <BackgroundVideoDome path={scene360BackendAssets[backgroundEnvironment.preset].static_url} />;
        } else {
            return (
                <BackgroundImageDome
                    path={scene360BackendAssets[backgroundEnvironment.preset].static_url}
                    environment={backgroundEnvironment}
                />
            );
        }
    } else {
        return null;
    }
};

export default Background;
