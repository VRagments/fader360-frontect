import { wrappers_FirstProjectInitAndSendToStore, wrappers_ViewerProjectSyncToStore } from '../lib/api_and_store_wrappers';
import useZustand from '../lib/zustand/zustand';
import { useEffect, useMemo, useRef, useState } from 'react';
import ScenePicker from '../components/ScenePicker';
import FaderThreeCanvas from '../components/THREE/FaderThreeCanvas';
import AssetUi from '../components/AssetUI/AssetUi';
import PanelsSlideOut from '../components/AssetUI/PanelsSlideOut';
import OptionsPanel from '../components/AssetUI/OptionsPanel';
import ViewSettingsPanel from '../components/AssetUI/ViewSettingsPanel';
import Nav from '../components/Nav';
import { api_ShowProject } from '../lib/axios';
import { FaderStoryType } from '../types/FaderTypes';

export type FaderStoryEditorViewerPropsType = {
    storyId: string | null;
    mode: 'view' | 'edit';
    debug: boolean;
};
const FaderStory = ({ storyId, mode, debug }: FaderStoryEditorViewerPropsType) => {
    const faderScenes = useZustand((state) => state.fader.faderScenes);
    const faderStory = useZustand((state) => state.fader.faderStory);
    const currentSceneId = useZustand((state) => state.fader.currentFaderSceneId);
    const storeSetCurrentSceneId = useZustand((state) => state.methods.storeSetCurrentSceneId);

    const viewMode = mode === 'view' ? true : false;

    /** To find out if we're logged in and able to access this story (so, should be owner or collaborator), make a private api call. If result, use private calls from here on, enabling Viewmode for non-discoverable Stories */
    const [userNameRemote, setUserNameRemote] = useState<string | null>(null);
    storyId &&
        api_ShowProject(storyId, true)
            .then((res) => {
                res && setUserNameRemote((res as FaderStoryType).author as string);
            })
            .catch(() => {
                setUserNameRemote(null);
            });

    useEffect(() => {
        /* A storyid is provided via query param, and there is none set yet, or the current faderStory is stale: */
        if (storyId && (!faderStory || storyId !== faderStory.id) && userNameRemote !== undefined) {
            if (viewMode && !userNameRemote) {
                wrappers_ViewerProjectSyncToStore(storyId).catch((err: string) => new Error(err));
            } else {
                wrappers_FirstProjectInitAndSendToStore(storyId).catch((err: string) => new Error(err));
            }
        }
    }, [storyId, userNameRemote]);

    /* Sets options side panel ('' opens the side panel), set to open on scene-switch */
    const [openPanel, setOpenPanel] = useState<'' | 'assets' | 'options'>('');
    useEffect(() => {
        if (currentSceneId) {
            setOpenPanel('');
        }
    }, [currentSceneId]);

    /* Get Canvas dimensions on-screen to correctly position options side panel: */
    const faderThreeCanvasParentRef = useRef<HTMLDivElement>(null);
    const [assetPanelParentRect, setAssetPanelParentRect] = useState({ x: 0, y: 0 });
    useEffect(() => {
        if (faderThreeCanvasParentRef.current) {
            const elemRect = faderThreeCanvasParentRef.current.getBoundingClientRect();
            setAssetPanelParentRect({ x: -elemRect.width - 10, y: elemRect.top - 10 }); // '10' is a hardcoded leva value
        }
    }, [faderThreeCanvasParentRef.current]);

    /* Code for stepping through FaderScene's in Viewmode: */
    const orderedArrayOfScenes = useMemo(() => {
        if (faderStory && faderScenes && Object.keys(faderScenes).length) {
            return faderStory.data.sceneOrder.map((orderedId) => faderScenes[orderedId]);
        } else {
            return [];
        }
    }, [faderScenes, faderStory]);

    const currentPlaceInSceneOrderRef = useRef(0);
    const scenePickerViewModeProgressRef = useRef<HTMLSpanElement>(null);
    const [play, setPlay] = useState(false);

    useEffect(() => {
        let timer: number | NodeJS.Timeout;
        let progressInterval: number | NodeJS.Timer;

        if (play && orderedArrayOfScenes.length) {
            if (currentSceneId) {
                /* Handles a user's click on navigatable FaderScene in <ScenePicker> : */
                if (currentSceneId !== orderedArrayOfScenes[currentPlaceInSceneOrderRef.current].id) {
                    currentPlaceInSceneOrderRef.current = orderedArrayOfScenes.findIndex((scene) => scene.id === currentSceneId);
                }

                const timerDurationMs = parseInt(orderedArrayOfScenes[currentPlaceInSceneOrderRef.current].duration) * 1000;

                timer = setTimeout(() => {
                    if (currentPlaceInSceneOrderRef.current < orderedArrayOfScenes.length - 1) {
                        currentPlaceInSceneOrderRef.current += 1;
                        storeSetCurrentSceneId(orderedArrayOfScenes[currentPlaceInSceneOrderRef.current].id);
                    } else {
                        /* Wrap around to start: */
                        currentPlaceInSceneOrderRef.current = 0;
                    }
                }, timerDurationMs);

                const intervalFraction = 50;

                progressInterval = setInterval(() => {
                    if (scenePickerViewModeProgressRef.current) {
                        const currentWidth = parseInt(scenePickerViewModeProgressRef.current.style.width.replace('%', ''));

                        if (currentWidth < 100) {
                            scenePickerViewModeProgressRef.current.style.setProperty('width', `${currentWidth + 100 / intervalFraction}%`);
                        }
                    }
                }, timerDurationMs / intervalFraction);
            }
        }

        return () => {
            /* Clear existing timeOuts and intervals: */
            if (timer) {
                clearTimeout(timer);
            }
            if (progressInterval) {
                clearInterval(progressInterval);
            }
        };
    }, [play, currentSceneId, orderedArrayOfScenes]);

    /* For receiving updates to subtitle Track cues: */
    const activeSubtitle = useZustand((state) => state.fader.activeSubtitle);

    if (!storyId) {
        return <div className='text-slate-300'>No Story id provided!</div>;
    } else if (!faderStory) {
        if (viewMode) {
            return (
                <div className='text-slate-300'>
                    Cannot load Story data!
                    <br />
                    <br />
                    Has the Story-Owner set the Story to 'discoverable'?
                </div>
            );
        } else {
            return (
                <div className='text-slate-300'>
                    Cannot load Story data! Are you sure you're logged in?
                    <br />
                    <br />
                    <a href={`view?project_id=${storyId}`}>View this Story in ViewMode</a>
                </div>
            );
        }
    } else if (!faderScenes) {
        return (
            <div className='text-slate-300'>
                Cannot load Scenes!
                <br />
                <br />
                Does this FaderStory have any Scenes created?
            </div>
        );
    } else if (viewMode && !play) {
        /* Not clicked on play yet: */
        return (
            <>
                <div className='relative h-full'>
                    <div className='absolute top-0 z-10 mx-auto flex h-full w-full flex-col items-center justify-center bg-black/75'>
                        <div className='rounded-full bg-white p-4'>
                            <div
                                className='cursor-pointer rounded-full bg-blue-400 p-6 text-white transition-colors hover:bg-blue-200 hover:text-blue-800'
                                onClick={() => {
                                    setPlay(true);

                                    /* Set an id to start the Anim loop */
                                    orderedArrayOfScenes.length &&
                                        storeSetCurrentSceneId(orderedArrayOfScenes[currentPlaceInSceneOrderRef.current].id);
                                }}
                            >
                                Play
                            </div>
                        </div>
                    </div>

                    {faderStory.preview_image && (
                        <div className='flex h-full w-full justify-center p-6 drop-shadow-2xl'>
                            <img className='h-[90%] rounded-lg object-scale-down' src={faderStory.preview_image} />
                        </div>
                    )}
                </div>
            </>
        );
    } else {
        return (
            <>
                {!viewMode && <Nav storyId={storyId} />}

                <div className='relative h-full w-full flex-1 bg-slate-800'>
                    {faderScenes[currentSceneId] ? (
                        <div ref={faderThreeCanvasParentRef} className='h-full w-full'>
                            <FaderThreeCanvas scene={faderScenes[currentSceneId]} viewMode={viewMode} debug={debug} />
                        </div>
                    ) : (
                        <>
                            {faderStory.preview_image && (
                                <div className='flex h-full w-full justify-center p-6 drop-shadow-2xl'>
                                    <img className='h-[90%] rounded-lg object-scale-down' src={faderStory.preview_image} />
                                </div>
                            )}
                        </>
                    )}

                    {/* Overlays (Scene picker, Scene name etc) : */}
                    <div className='pointer-events-none' /* << to enable 'clicking through' to THREE canvas */>
                        {/* Leva Gui: */}
                        <ViewSettingsPanel />

                        {!viewMode && faderScenes[currentSceneId] && (
                            <>
                                {openPanel == '' && <PanelsSlideOut setOpenPanel={setOpenPanel} position={assetPanelParentRect} />}
                                {openPanel == 'assets' && (
                                    <AssetUi setOpenPanel={setOpenPanel} currentScene={faderScenes[currentSceneId]} />
                                )}
                                {openPanel == 'options' && (
                                    <OptionsPanel setOpenPanel={setOpenPanel} currentScene={faderScenes[currentSceneId]} />
                                )}
                            </>
                        )}

                        {/* Other Control elements:  */}
                        <div className='absolute top-0 z-30 flex h-full w-full flex-col items-center justify-between p-2'>
                            {/* Story/User: */}
                            <div className='w-1/5 rounded-md bg-slate-500 bg-opacity-75 px-2 py-1 text-center text-slate-200 drop-shadow-2xl'>
                                <b>{faderStory.name}</b> by <i>{faderStory.user_display_name}</i>
                            </div>

                            {/* Subtitles:  */}
                            <div className='mb-6 mt-auto whitespace-pre-wrap text-center text-5xl text-gray-100 drop-shadow-[0_0.1rem_0.1rem_rgba(0,0,0,0.8)]'>
                                {activeSubtitle}
                            </div>

                            {/* Scene picking: */}
                            <ScenePicker
                                ref={scenePickerViewModeProgressRef}
                                storyData={faderStory.data}
                                faderScenes={faderScenes}
                                viewMode={viewMode}
                                className='flex w-2/3 max-w-fit content-center justify-between justify-self-end rounded-md bg-slate-500 bg-opacity-75 p-1 text-slate-200 drop-shadow-2xl'
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    }
};

export default FaderStory;
