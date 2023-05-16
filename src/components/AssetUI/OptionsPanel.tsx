import { LevaPanel } from 'leva';
import useZustand from '../../lib/zustand/zustand';
import { levaThemeValues, levaValuesForTw } from '../../style/levaTheme';
import { useControlsWrapperSceneOptions } from '../../lib/hooks/useLevaControls';
import { FaderSceneType } from '../../types/FaderTypes';
import { XCircleIcon } from '@heroicons/react/24/solid';

type OptionsPanelProps = {
    setOpenPanel: React.Dispatch<React.SetStateAction<'' | 'assets' | 'options'>>;
    currentScene: FaderSceneType;
};
const OptionsPanel = ({ setOpenPanel, currentScene }: OptionsPanelProps) => {
    const faderLevaOptionsStore = useZustand((state) => state.fader.faderLevaOptionsStore);

    faderLevaOptionsStore && useControlsWrapperSceneOptions(faderLevaOptionsStore, currentScene);

    return (
        <div
            className={
                'pointer-events-auto absolute right-0 top-0 z-30 m-2 rounded-md bg-slate-500 bg-opacity-75 drop-shadow-2xl' +
                levaValuesForTw.fontSizes.root
            }
        >
            <LevaPanel
                store={faderLevaOptionsStore}
                theme={levaThemeValues}
                titleBar={{
                    title: 'Options',
                    drag: false,
                    filter: false,
                }}
                flat
                fill
                hideCopyButton
            />
            {/* Needs to be absolutely positioned atop of Leva's title bar (we have no direct access to their html): */}
            <XCircleIcon
                className='absolute right-0 top-0 mr-1 h-8 w-8 cursor-pointer fill-slate-200 p-1 hover:fill-slate-500'
                onClick={() => {
                    setOpenPanel('');
                }}
            />
        </div>
    );
};

export default OptionsPanel;
