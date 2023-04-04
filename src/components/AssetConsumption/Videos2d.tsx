import { FaderBackendAsset, FaderSceneType } from '../../types/FaderTypes';
import { mergeHexAndOpacityValues } from '../../methods/colorHelpers';
import Asset, { AssetJsxElementParams } from './Asset';
import Hls from 'hls.js';
import { useEffect, useRef } from 'react';

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

const Video2dJsxElement = ({ asset, backendAsset, assetDataRef }: AssetJsxElementParams) => {
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
        <div
            id={asset.id}
            className='fader-3d-card'
            style={{
                color: assetDataRef.current.textColor,
                backgroundColor: assetDataRef.current.backgroundOn
                    ? mergeHexAndOpacityValues(assetDataRef.current.backgroundColor, assetDataRef.current.backgroundOpacity)
                    : 'transparent',
                border: `2px ${assetDataRef.current.frameOn ? 'solid' : 'none'} ${mergeHexAndOpacityValues(
                    assetDataRef.current.frameColor,
                    assetDataRef.current.frameOpacity
                )}`,
            }}
        >
            <div
                className='bold mb-1 w-full rounded p-1 px-2 text-lg'
                style={{
                    backgroundColor: assetDataRef.current.backgroundOn
                        ? mergeHexAndOpacityValues(assetDataRef.current.backgroundColor, assetDataRef.current.backgroundOpacity)
                        : 'transparent',
                }}
            >
                {assetDataRef.current.headline}
            </div>
            <video
                ref={videoRef}
                controls
                playsInline
                preload='auto'
                autoPlay={false}
                crossOrigin='anonymous'
                disablePictureInPicture
                width={backendAsset.attributes.width}
                height={backendAsset.attributes.height}
                poster={backendAsset.preview_image as string}
            />
        </div>
    );
};
