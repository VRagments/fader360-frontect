import { Cog6ToothIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import useZustand from '../../lib/zustand/zustand';
import { levaValuesForTw } from '../../style/levaTheme';

const ViewSettingsPanel = () => {
    const [viewSettingsVisible, setViewSettingsVisible] = useState(false);

    return (
        <div className='absolute bottom-0 right-0 z-30 m-2 flex flex-col items-end justify-end'>
            {viewSettingsVisible && <ViewSettings />}

            <div className='group pointer-events-auto flex w-max flex-col rounded-md bg-slate-700 bg-opacity-20 p-1 hover:bg-opacity-100'>
                <div
                    className='flex h-12 w-12 cursor-pointer flex-col items-center justify-around rounded-sm bg-slate-500 bg-opacity-10 p-1 group-hover:bg-slate-400 group-hover:bg-opacity-100'
                    onClick={() => setViewSettingsVisible(!viewSettingsVisible)}
                >
                    <Cog6ToothIcon
                        className={
                            'h-10 w-10 opacity-40 group-hover:bg-slate-400 group-hover:opacity-100' + levaValuesForTw.colors.highlight1.fill
                        }
                    />
                    <span
                        className={
                            'text-center font-mono text-2xs opacity-40 group-hover:opacity-100' + levaValuesForTw.colors.highlight1.text
                        }
                    >
                        Settings
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ViewSettingsPanel;

const ViewSettings = () => {
    const videoSettings = useZustand((state) => state.siteData.videoSettings);
    const storeSetvideoSettings = useZustand((state) => state.methods.storeSetvideoSettings);

    const activeSubtitle = useZustand((state) => state.fader.activeSubtitle);

    return (
        <div className='pointer-events-auto mb-1 flex h-max w-max flex-col rounded-md bg-slate-700 p-1 text-sm font-medium text-slate-200'>
            {activeSubtitle !== undefined ? (
                <div className='flex h-full w-full cursor-pointer flex-col items-start rounded-sm bg-slate-500 p-2'>
                    <div>
                        <label htmlFor='subtitle-checkbox' className='mr-2 align-middle'>
                            Show Subtitles for Background Video
                        </label>
                        <input
                            id='subtitle-checkbox'
                            type='checkbox'
                            checked={videoSettings.subtitles}
                            className='w-4 rounded border-gray-300 bg-gray-100 align-middle text-blue-600 focus:ring-2 focus:ring-blue-500'
                            onChange={() => {
                                storeSetvideoSettings({
                                    subtitles: !videoSettings.subtitles,
                                });
                            }}
                        />
                    </div>

                    {videoSettings.subtitles && videoSettings.subtitleLanguagesAvailable.length > 0 && (
                        <div className='relative mt-2 w-full'>
                            <label htmlFor='subtitle-languages' className='mb-1 mr-auto mt-2'>
                                Select Subtitle Language
                            </label>
                            <select
                                id='subtitle-languages'
                                className='absolute right-0 w-1/4 rounded-md border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 '
                                value={videoSettings.subtitleLanguage}
                                onChange={(ev) => {
                                    storeSetvideoSettings({ subtitleLanguage: ev.target.value });
                                }}
                            >
                                {videoSettings.subtitleLanguagesAvailable.map((subtitleLang, idx) => (
                                    <option key={`${idx}-${subtitleLang}`} value={subtitleLang}>
                                        {subtitleLang}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            ) : (
                <span>No Options available (Background Video not set) </span>
            )}
        </div>
    );
};
