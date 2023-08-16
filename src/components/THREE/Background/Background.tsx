import { isUUID } from '../../../lib/helpers';
import { FaderBackendAsset, FaderSceneDataType, FaderStoryType } from '../../../types/FaderTypes';
import BackgroundImageDome from './BackgroundImageDome';
import BackgroundVideoDome from './BackgroundVideoDome';

type BackgroundProps = {
    scene360BackendAssets: Record<string, FaderBackendAsset>;
    backgroundEnvironment: FaderSceneDataType['environment'];
    projectId: FaderStoryType['id'];
};
const Background = (props: BackgroundProps) => {
    const { scene360BackendAssets, backgroundEnvironment, projectId } = props;

    if (isUUID(backgroundEnvironment.preset)) {
        if (scene360BackendAssets[backgroundEnvironment.preset].media_type.includes('video')) {
            return <BackgroundVideoDome backendVideoAsset={scene360BackendAssets[backgroundEnvironment.preset]} projectId={projectId} />;
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
