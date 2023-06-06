import { FaderBackendAsset, FaderSceneType, FaderVideoSubtitlesType } from '../../../types/FaderTypes';
import AssetWrapper, { AssetJsxElementParams } from './AssetWrapper';
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { defaultCardWidth, defaultCardHeight } from '../../../lib/defaults';
import { wrappers_UpdateSceneInLocalAndRemote } from '../../../lib/api_and_store_wrappers';
import { api_ListAssetSubtitles, api_ListPublicAssetSubtitles } from '../../../lib/axios';
import { cloneDeep } from 'lodash';
import srtToWebVtt from '../../../lib/methods/srtToWebVtt';
import { handleErr } from '../../../lib/methods/handleErr';

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
                /* deep clone since I can't assign subtitles else */
                const videoAsset = cloneDeep(scene.data.assets[videoId]);

                if (videoAsset) {
                    const videoBackendAsset = storyVideo2dBackendAssets[videoAsset.backendId];

                    if (viewMode) {
                        api_ListPublicAssetSubtitles(scene.project_id, videoBackendAsset.id)
                            .then((subtitles) => {
                                videoAsset.data.subtitles = subtitles;
                            })
                            .catch((e) => {
                                handleErr(e);
                            });
                    } else {
                        api_ListAssetSubtitles(videoBackendAsset.id)
                            .then((subtitles) => {
                                videoAsset.data.subtitles = subtitles;
                            })
                            .catch((e) => {
                                handleErr(e);
                            });
                    }

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

    const [vttSubs, setVttSubs] = useState<WebVTTSubsType[]>();

    useEffect(() => {
        if (asset.data.subtitles && asset.data.subtitles.length && !vttSubs) {
            fetchSrtAndConvertToVttBlob(asset.data.subtitles)
                .then((result) => setVttSubs(result))
                .catch((e) => handleErr(e));
        }
    }, [asset]);

    const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
    const hls = useRef({ hls: new Hls(), videoSource: backendAsset.static_url });

    useEffect(() => {
        if (videoRef) {
            /* Once videoRefs have been set:  */
            hls.current.hls.loadSource(hls.current.videoSource);
            hls.current.hls.attachMedia(videoRef);

            hls.current.hls.on(Hls.Events.ERROR, (event, data) => {
                // eslint-disable-next-line no-console
                handleErr(event, data);
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
            {vttSubs &&
                vttSubs.map((vttSubtitle, idx) => {
                    return (
                        <track
                            key={`track, ${idx}`}
                            kind='subtitles'
                            label={vttSubtitle.lang}
                            src={vttSubtitle.blobUrl}
                            srcLang={vttSubtitle.lang}
                        />
                    );
                })}
        </video>
    );
};

export const fetchSrtAndConvertToVttBlob = async (srtSubtitles: FaderVideoSubtitlesType[]) => {
    const vttSubsArr: WebVTTSubsType[] = [];
    let isLoaded = false;

    for (const [i, srtSubtitle] of srtSubtitles.entries()) {
        await fetchSrt(srtSubtitle.static_url)
            .then((srtResult) => {
                const webVtt = srtToWebVtt(srtResult);
                const vttBlob = new Blob([webVtt], {
                    type: 'text/plain',
                });

                const vttSub = {
                    lang: srtSubtitle.language,
                    text: webVtt,
                    blobUrl: URL.createObjectURL(vttBlob),
                };

                vttSubsArr.push(vttSub);

                if (i == srtSubtitles.length - 1) {
                    isLoaded = true;
                }
            })
            .catch((e) => {
                handleErr(e);
            });
    }

    let timer: number | NodeJS.Timeout;

    const returnAfterCompleted = () => {
        if (isLoaded) {
            return vttSubsArr;
        } else {
            timer && clearTimeout(timer);
            timer = setTimeout(returnAfterCompleted, 500);
        }
    };

    return returnAfterCompleted();
};

const fetchSrt = async (srtPath: string) => {
    const response = await fetch(srtPath);
    const responseText = await response.text();

    return responseText;
};

/**
 * Types
 */

export type WebVTTSubsType = { lang: string; text: string; blobUrl: string };
