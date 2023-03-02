import { useState } from 'react';
import THREEScene from '../components/THREEScene';
import { apiAuthTokenToStore, apiListAllProjects } from '../lib/axios';
import useZustand from '../lib/zustand/zustand';
import { useEffect } from 'react';

const FaderStoryEditor = () => {
    const apiAuthToken = useZustand((state) => state.siteData.apiAuthToken);
    const currentFaderStory = useZustand((state) => state.project);

    const [sceneId, setSceneId] = useState<string>('');

    if (!apiAuthToken) {
        apiAuthTokenToStore({ username: 'jensVrag', password: 'jVragments' }).catch((error: string) => error);
    }

    useEffect(() => {
        if (apiAuthToken) {
            /* Get Projects and - for now - puts project[0] to Store */
            apiListAllProjects().catch((error: string) => error);
        }
    }, [apiAuthToken]);

    if (!currentFaderStory) {
        return null;
    }

    return (
        <div>
            <div className='relative m-10 flex flex-col items-center justify-center bg-slate-800'>
                <div className='absolute top-0 z-10 m-2 rounded-md bg-slate-500 py-1 px-2 text-slate-200'>
                    <b>{currentFaderStory.name}</b> by <i>{currentFaderStory.user_display_name}</i>
                </div>

                <div className='relative h-[32rem] w-4/5 rounded-md border-2'>
                    {sceneId ? (
                        <THREEScene sceneId={sceneId} />
                    ) : (
                        <div className='h-full w-full'>
                            {currentFaderStory.preview_image && (
                                <img className='h-full w-full object-contain' src={currentFaderStory.preview_image} />
                            )}
                        </div>
                    )}
                </div>

                <div className='absolute bottom-0 z-10 m-2 rounded-md bg-slate-500 py-1 px-2 text-slate-200'>
                    Pick Scene:
                    <>
                        {currentFaderStory.data.sceneOrder.map((sceneId, idx, arr) => {
                            const sceneName = currentFaderStory.data.scenes[sceneId].name;

                            return (
                                <div key={sceneId} className='inline-block'>
                                    <div
                                        onClick={() => setSceneId(sceneId)}
                                        className='m-1 cursor-pointer rounded-md bg-slate-700 p-1 hover:bg-slate-600'
                                    >
                                        {idx + 1}/{arr.length}:<div>{sceneName}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                </div>
            </div>
        </div>
    );
};

export default FaderStoryEditor;
