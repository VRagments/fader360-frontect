import Hls from 'hls.js';
import { useMemo, useEffect, useState, useRef } from 'react';
import { BackSide } from 'three';
import { api_ListAssetSubtitles, api_ListPublicAssetSubtitles } from '../../../lib/axios';
import { backgroundSphereGeometryArgs } from '../../../lib/defaults';
import { handleErr } from '../../../lib/methods/handleErr';
import useZustand from '../../../lib/zustand/zustand';
import { FaderBackendAsset, FaderStoryType } from '../../../types/FaderTypes';
import { fetchSrtAndConvertToVttBlob, WebVTTSubsType } from '../AssetConsumption/Videos2d';

const BackgroundVideoDome = ({
    backendVideoAsset,
    viewMode,
    projectId,
}: {
    backendVideoAsset: FaderBackendAsset;
    viewMode: boolean;
    projectId: FaderStoryType['id'];
}) => {
    if (!Hls.isSupported()) {
        return <></>;
    }

    const viewModeSettings = useZustand((state) => state.siteData.viewModeSettings);
    const storeSetViewModeSettings = useZustand((state) => state.methods.storeSetViewModeSettings);
    const storeSetActiveSubtitle = useZustand((state) => state.methods.storeSetActiveSubtitle);

    const [vttSubs, setVttSubs] = useState<WebVTTSubsType[]>();

    useEffect(() => {
        if (viewMode) {
            api_ListPublicAssetSubtitles(projectId, backendVideoAsset.id)
                .then((srtSubtitles) => {
                    if (srtSubtitles) {
                        fetchSrtAndConvertToVttBlob(srtSubtitles)
                            .then((result) => {
                                result && !vttSubs && setVttSubs(result);
                            })
                            .catch((e) => handleErr(e));
                    }
                })
                .catch((e) => {
                    handleErr(e);
                });
        } else {
            api_ListAssetSubtitles(backendVideoAsset.id)
                .then((srtSubtitles) => {
                    if (srtSubtitles) {
                        fetchSrtAndConvertToVttBlob(srtSubtitles)
                            .then((result) => {
                                result && !vttSubs && setVttSubs(result);
                            })
                            .catch((e) => handleErr(e));
                    }
                })
                .catch((e) => {
                    handleErr(e);
                });
        }

        /* Setting to null at start, since ViewSettingsPanel checks for undefined in order to render/not render */
        storeSetActiveSubtitle(null);

        /* Remove <video> element (or rather, it's parent) on unMount */
        return () => {
            videoElementParent.removeChild(videoElement);
            storeSetActiveSubtitle(undefined);
        };
    }, []);

    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const [subLanguages, setSubLanguages] = useState<string[]>([]);

    const [videoElement, videoElementParent] = useMemo(() => {
        if (!videoElementRef.current) {
            const videoElement = document.createElement('video');
            videoElement.id = 'BackgroundVideoDome Video Element';
            videoElement.loop = true; // TODO control this somewhere
            videoElement.append('Your browser does not support the video tag.');

            /* Needed in order to destroy <video> element on unMount: */
            const videoElementParent = document.createElement('div');
            videoElementParent.id = 'BackgroundVideoDome Video Parent Element';
            videoElementParent.appendChild(videoElement);

            const hls = new Hls();
            addHlsEventListeners(hls);

            hls.loadSource(backendVideoAsset.static_url);
            hls.attachMedia(videoElement);

            videoElementRef.current = videoElement;
            videoElementRef.current.play().catch((err) => handleErr(err));
        }

        if (vttSubs) {
            vttSubs.forEach((vttSub, idx) => {
                const vttBlob = new Blob([vttSub.text], {
                    type: 'text/plain',
                });

                const trackElement = document.createElement('track');

                trackElement.id = `${vttSub.lang}-track-${idx}`;
                trackElement.label = vttSub.lang;
                trackElement.srclang = vttSub.lang;
                trackElement.src = URL.createObjectURL(vttBlob);
                trackElement.oncuechange = (ev) => {
                    const trackElem = ev.target as HTMLTrackElement;

                    if (trackElem && trackElem.default && trackElem.track.activeCues) {
                        // @ts-expect-error -> yes, 'text' does exist
                        storeSetActiveSubtitle(trackElem.track.activeCues[0] ? (trackElem.track.activeCues[0].text as string) : null);
                    }
                };

                videoElementRef.current!.appendChild(trackElement);

                setSubLanguages((subLanguages) => [...subLanguages, vttSub.lang]);
            });

            for (const track of videoElementRef.current.textTracks) {
                track.mode = 'hidden';
            }
        }

        return [videoElementRef.current, videoElementRef.current.parentElement!];
    }, [backendVideoAsset, vttSubs]);

    useEffect(() => {
        storeSetViewModeSettings({ subtitleLanguagesAvailable: subLanguages });
    }, [subLanguages]);

    useEffect(() => {
        if (videoElementRef.current && vttSubs) {
            /* Set first trackElement as active: */
            if (!viewModeSettings.subtitleLanguage && viewModeSettings.subtitleLanguagesAvailable.length > 0) {
                storeSetViewModeSettings({
                    subtitleLanguage: videoElementRef.current.textTracks[0].language,
                });
            }

            for (const child of videoElementRef.current.textTracks) {
                let matchedChildElement: HTMLTrackElement;

                /* Find the corresponding HTMLTrackElement so we can set 'default' property: */
                for (const childElem of videoElementRef.current.children) {
                    if ((childElem as HTMLTrackElement).srclang === child.language) {
                        matchedChildElement = childElem as HTMLTrackElement;
                    }
                }

                if (viewModeSettings.subtitles === false) {
                    storeSetActiveSubtitle(null);
                    child.mode = 'disabled';
                    matchedChildElement!.default = false;
                } else {
                    if (viewModeSettings.subtitleLanguage) {
                        if (child.language.includes(viewModeSettings.subtitleLanguage)) {
                            child.mode = 'showing';
                            matchedChildElement!.default = true;
                        } else {
                            child.mode = 'disabled';
                            matchedChildElement!.default = false;
                        }
                    }
                }
            }
        }
    }, [vttSubs, viewModeSettings]);

    return (
        <>
            <mesh name='Background Video Dome' scale={[-1, 1, 1]}>
                <sphereGeometry attach='geometry' args={backgroundSphereGeometryArgs} name='Background Video Dome Geometry' />
                <meshBasicMaterial attach='material' side={BackSide} name='Background Video Dome Geometry'>
                    <videoTexture attach='map' args={[videoElement]} name='Background Video Dome VideoTexture' />
                </meshBasicMaterial>
            </mesh>
        </>
    );
};

function addHlsEventListeners(hls: Hls) {
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        // Use later?
    });

    hls.on(Hls.Events.MANIFEST_PARSED, function (_event, _data) {
        // console.log(`manifest loaded, found ${data.levels.length} quality level. event :`, event);
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
        handleErr(event, data);
    });
}

export default BackgroundVideoDome;
