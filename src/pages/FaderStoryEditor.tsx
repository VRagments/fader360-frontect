import { wrappers_FirstProjectInitAndSendToStore, wrappers_AuthTokenToStore } from '../lib/api_and_store_wrappers';
import useZustand from '../lib/zustand/zustand';
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import buildConfig from '../buildConfig';
import ScenePicker from '../components/ScenePicker';
import FaderThreeCanvas from '../components/THREE/FaderThreeCanvas';
import { FaderSceneType } from '../types/FaderTypes';
import AssetUi from '../components/AssetUI/AssetUi';
import PanelsSlideOut from '../components/AssetUI/PanelsSlideOut';
import OptionsPanel from '../components/AssetUI/OptionsPanel';

const FaderStoryEditor = () => {
    const apiAuthToken = useZustand((state) => state.siteData.apiAuthToken);

    /* TODO Grabs AuthToken or fetches/initializes projects, scenes, backendAssets - This might be placed elsewhere? TBD */
    useEffect(() => {
        if (apiAuthToken) {
            wrappers_FirstProjectInitAndSendToStore().catch((err: string) => new Error(err));
        } else {
            wrappers_AuthTokenToStore({
                username: buildConfig.login.username as string,
                password: buildConfig.login.password as string,
            }).catch((err: string) => new Error(err));
        }
    }, [apiAuthToken]);

    /* If no sub-route with Scene's guid ( '/edit/:sceneIdParam' ) exists, returns undefined. Renders preview_image then (see below) */
    const { sceneIdParam } = useParams();

    /* Define current scene in State: */
    const faderScenes = useZustand((state) => state.fader.faderScenes);
    const [currentScene, setCurrentScene] = useState<FaderSceneType | null>(null);
    useEffect(() => {
        if (sceneIdParam && faderScenes) {
            setCurrentScene(faderScenes[sceneIdParam]);
        }
    }, [sceneIdParam, faderScenes]);

    /* Sets options side panel ('' opens the side panel), set to open on scene-switch */
    const [openPanel, setOpenPanel] = useState<'' | 'assets' | 'options'>('');
    useEffect(() => {
        if (currentScene?.id) {
            setOpenPanel('');
        }
    }, [currentScene?.id]);

    /* Get Canvas dimensions on-screen to correctly position options side panel: */
    const faderThreeCanvasParentRef = useRef<HTMLDivElement>(null);
    const [assetPanelParentRect, setAssetPanelParentRect] = useState({ x: 0, y: 0 });
    useEffect(() => {
        if (faderThreeCanvasParentRef.current) {
            const elemRect = faderThreeCanvasParentRef.current.getBoundingClientRect();
            setAssetPanelParentRect({ x: -elemRect.width - 10, y: elemRect.top - 10 }); // '10' is a hardcoded leva value
        }
    }, [currentScene, faderThreeCanvasParentRef.current]);

    /* Debug mode active with a `?debug` url param */
    const debug = buildConfig.dev.debugURLenabled ? (useSearchParams()[0].get('debug') === '' ? true : false) : false;

    const faderStory = useZustand((state) => state.fader.faderStory);
    if (!faderStory) {
        return <div className='text-slate-300'>Cannot load Story data!</div>;
    } else {
        return (
            <div className='relative flex-1 bg-slate-800'>
                {currentScene ? (
                    <div ref={faderThreeCanvasParentRef} className='h-full w-full'>
                        <FaderThreeCanvas scene={currentScene} debug={debug} />
                    </div>
                ) : (
                    <>
                        {faderStory.preview_image && (
                            <div className='absolute w-full p-8 drop-shadow-2xl'>
                                <img className='m-auto max-h-[90%] w-4/5 rounded-lg object-scale-down' src={faderStory.preview_image} />
                            </div>
                        )}
                    </>
                )}

                {/* Overlays (Scene picker, Scene name etc) : */}
                <div className='pointer-events-none' /* << to enable 'clicking through' to THREE canvas */>
                    {/* Leva Gui: */}
                    {currentScene ? (
                        <>
                            {openPanel == '' && <PanelsSlideOut setOpenPanel={setOpenPanel} position={assetPanelParentRect} />}
                            {openPanel == 'assets' && <AssetUi setOpenPanel={setOpenPanel} currentScene={currentScene} />}
                            {openPanel == 'options' && <OptionsPanel setOpenPanel={setOpenPanel} currentScene={currentScene} />}
                        </>
                    ) : null}

                    {/* Other Control elements:  */}
                    <div className='absolute top-0 z-10 flex h-full w-full flex-col items-center justify-between'>
                        {/* Story/User: */}
                        <div className='m-2 w-1/5 rounded-md bg-slate-500 bg-opacity-75 py-1 px-2 text-center text-slate-200 drop-shadow-2xl'>
                            <b>{faderStory.name}</b> by <i>{faderStory.user_display_name}</i>
                        </div>

                        {/* Scene picking: */}
                        {faderScenes && <ScenePicker storyData={faderStory.data} currentSceneId={sceneIdParam} faderScenes={faderScenes} />}
                    </div>
                </div>
            </div>
        );
    }
};

export default FaderStoryEditor;
