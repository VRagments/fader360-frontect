import { FaderBackendAsset, FaderSceneType } from '../../../types/FaderTypes';
import AssetWrapper, { AssetJsxElementParams } from './AssetWrapper';
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { defaultCardWidth, defaultCardHeight } from '../../../lib/defaults';
import { wrappers_UpdateSceneInLocalAndRemote } from '../../../lib/api_and_store_wrappers';

type Videos2dProps = {
    scene: FaderSceneType;
    storyVideo2dBackendAssets: Record<string, FaderBackendAsset>;
    viewMode: boolean;
};
const Videos2d = (props: Videos2dProps) => {
    const { scene, storyVideo2dBackendAssets, viewMode } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['Video2D'].map((videoId, idx) => {
                const videoAsset = scene.data.assets[videoId];

                if (videoAsset) {
                    const videoBackendAsset = storyVideo2dBackendAssets[videoAsset.backendId];

                    /* Update the scene's duration to the longest Video asset's duration: */
                    if (videoBackendAsset.attributes.duration > parseFloat(scene.duration)) {
                        wrappers_UpdateSceneInLocalAndRemote({
                            ...scene,
                            duration: videoBackendAsset.attributes.duration.toString(),
                        });
                    }
                    return (
                        <AssetWrapper
                            key={`Video2d ${videoId} / ${idx}`}
                            scene={scene}
                            asset={videoAsset}
                            backendAsset={videoBackendAsset}
                            assetJsxElement={Video2dJsxElement}
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

export default Videos2d;

const Video2dJsxElement = ({ asset, backendAsset }: AssetJsxElementParams) => {
    if (!backendAsset || !Hls.isSupported()) {
        return <></>;
    }

    const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
    const hls = useRef({ hls: new Hls(), videoSource: backendAsset.static_url });

    useEffect(() => {
        if (videoRef) {
            /* Once videoRefs have been set:  */
            hls.current.hls.loadSource(hls.current.videoSource);
            hls.current.hls.attachMedia(videoRef);

            hls.current.hls.on(Hls.Events.ERROR, (event, data) => {
                // eslint-disable-next-line no-console
                console.error(`${event}, ${data}`);
            });
        }
    }, [videoRef]);

    return (
        <video
            ref={setVideoRef}
            controls
            playsInline
            preload='auto'
            autoPlay={asset.data.autoPlay}
            loop={asset.data.loop}
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
