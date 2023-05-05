import { FaderBackendAsset, FaderSceneType } from '../../types/FaderTypes';
import Asset, { AssetJsxElementParams } from './Asset';
import Hls from 'hls.js';
import { useEffect, useRef } from 'react';
import { defaultCardWidth, defaultCardHeight } from '../../lib/defaults';

type Videos2dProps = {
    scene: FaderSceneType;
    storyVideo2dBackendAssets: Record<string, FaderBackendAsset>;
};
const Videos2d = (props: Videos2dProps) => {
    const { scene, storyVideo2dBackendAssets } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['Video2D'].map((videoId, idx) => {
                const videoAsset = scene.data.assets[videoId];

                if (videoAsset) {
                    const videoBackendAsset = storyVideo2dBackendAssets[videoAsset.backendId];

                    return (
                        <Asset
                            key={`Video2d ${videoId} / ${idx}`}
                            scene={scene}
                            asset={videoAsset}
                            backendAsset={videoBackendAsset}
                            assetJsxElement={Video2dJsxElement}
                        />
                    );
                } else {
                    return null;
                }
            })}
        </>
    );
};

export default Videos2d;

const Video2dJsxElement = ({ backendAsset }: AssetJsxElementParams) => {
    if (!backendAsset || !Hls.isSupported()) {
        return <></>;
    }

    const videoRef = useRef<HTMLVideoElement>(null);
    const hls = useRef({ hls: new Hls(), videoSource: backendAsset.static_url });

    useEffect(() => {
        if (videoRef.current) {
            /* Once videoRefs have been set:  */
            hls.current.hls.loadSource(hls.current.videoSource);
            hls.current.hls.attachMedia(videoRef.current);

            hls.current.hls.on(Hls.Events.ERROR, (event, data) => {
                throw new Error(`${event}, ${data}`);
            });
        }
    }, [videoRef.current]);

    return (
        <video
            ref={videoRef}
            controls
            playsInline
            preload='auto'
            autoPlay={false}
            crossOrigin='anonymous'
            disablePictureInPicture
            width={Math.min(backendAsset.attributes.width, defaultCardWidth)}
            height={Math.min(backendAsset.attributes.height, defaultCardHeight)}
            poster={backendAsset.preview_image as string}
        >
            Your device does not support this form of video playback!
        </video>
    );
};
