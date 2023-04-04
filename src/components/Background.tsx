import { NodeProps } from '@react-three/fiber';
import { SphereGeometry } from 'three';
import { FaderBackendAsset, FaderSceneDataType } from '../types/FaderTypes';
import BackgroundImageDome from './Background/BackgroundImageDome';
import BackgroundVideoDome from './Background/BackgroundVideoDome';

type BackgroundProps = {
    scene360BackendAssets: Record<string, FaderBackendAsset>;
    backgroundEnvironment: FaderSceneDataType['environment'];
};
const Background = (props: BackgroundProps) => {
    const { scene360BackendAssets, backgroundEnvironment } = props;

    if (isUUID(backgroundEnvironment.preset)) {
        if (scene360BackendAssets[backgroundEnvironment.preset].media_type === 'video/mp4') {
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

export const backgroundSphereGeometryArgs: NodeProps<SphereGeometry, typeof SphereGeometry>['args'] = [100, 64, 64]; // first arg does sort of 'zoom' (sphere radius)

export default Background;

/* https://stackoverflow.com/a/55138317 */
export function isUUID(uuid: string) {
    let s: string | RegExpMatchArray | null = '' + uuid;

    s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    if (s === null) {
        return false;
    }
    return true;
}
