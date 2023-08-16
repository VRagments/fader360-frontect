import Hls from 'hls.js';
import { useEffect, useMemo, useState } from 'react';
import { wrappers_UpdateSceneInLocalAndRemote } from '../../../lib/api_and_store_wrappers';
import { FaderBackendAsset, FaderSceneType } from '../../../types/FaderTypes';
import AssetWrapper, { AssetJsxElementProps } from './AssetWrapper';

type AudiosProps = {
    scene: FaderSceneType;
    storyAudioBackendAssets: Record<string, FaderBackendAsset>;
    viewMode: boolean;
};
const Audios = (props: AudiosProps) => {
    const { scene, storyAudioBackendAssets, viewMode } = props;

    return (
        <>
            {scene.data.assetOrderByGroup['Audio'].map((audioId, idx) => {
                const audioAsset = scene.data.assets[audioId];

                if (audioAsset) {
                    const audioBackendAsset = storyAudioBackendAssets[audioAsset.backendId];

                    /* Update the scene's duration to the longest Video asset's duration: */
                    if (audioBackendAsset.attributes.duration > parseFloat(scene.duration)) {
                        wrappers_UpdateSceneInLocalAndRemote({
                            ...scene,
                            duration: audioBackendAsset.attributes.duration.toString(),
                        });
                    }

                    return (
                        <AssetWrapper
                            key={`Audio ${audioId} / ${idx}`}
                            scene={scene}
                            asset={audioAsset}
                            backendAsset={audioBackendAsset}
                            assetJsxElement={AudioJsxElement}
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

export default Audios;

export const AudioJsxElement = ({ asset, backendAsset }: AssetJsxElementProps) => {
    if (!backendAsset || !asset || !Hls.isSupported()) {
        return <></>;
    }

    const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

    const isPlaylist = backendAsset.static_url.includes('.m3u8');

    const hlsMemo = useMemo(() => {
        if (isPlaylist) {
            return { hls: new Hls({ debug: false }), audioSource: backendAsset?.static_url };
        }
    }, [asset, backendAsset]);

    useEffect(() => {
        if (audioRef && hlsMemo) {
            /* Once audioRefs have been set:  */
            hlsMemo.hls.loadSource(hlsMemo.audioSource);
            hlsMemo.hls.attachMedia(audioRef);

            // WARN commenting out error-event-catching for now since it leads to "RangeError: Maximum call stack size exceeded at 'Hls.trigger'" errors. Should be fixed in an upcoming HLS update, see https://github.com/video-dev/hls.js/pull/5549
            // hls.current.hls.on(Hls.Events.ERROR, (event, data) => {
            //     handleErr(event, data);
            // });
        }
    }, [audioRef, hlsMemo]);

    return (
        <audio
            /* set reference to element via setAudioRef callback: */
            ref={setAudioRef}
            className='block h-fit w-fit'
            controls
            autoPlay={asset.data.autoPlay}
            loop={asset.data.loop}
            preload='auto'
            style={{ width: `260px`, height: `30px` }}
            src={isPlaylist ? undefined : backendAsset.static_url}
        >
            Your browser does not support the audio element.
        </audio>
    );
};
