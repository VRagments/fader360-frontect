import { LevaPanel, useCreateStore } from 'leva';
import { StoreType } from 'leva/dist/declarations/src/types';
import { useEffect } from 'react';
import { arrayOfFaderAssetGroupTypes } from '../../lib/defaults';
import useZustand from '../../lib/zustand/zustand';
import { useControlsWrapperOptionsPanel } from '../../methods/useLevaControls';
import { LevaThemeType } from '../../style/levaTheme';
import { FaderSceneType } from '../../types/FaderTypes';
import AddAsset from './AddAsset';
import AssetGroups from './AssetGroups';

type AssetPanelProps = {
    currentScene: FaderSceneType;
    selectedAssetState: [string, React.Dispatch<React.SetStateAction<string>>];
    theme: LevaThemeType;
};
const AssetPanel = ({ currentScene, selectedAssetState, theme }: AssetPanelProps) => {
    const storeSetFaderLevaOptionsStore = useZustand((state) => state.methods.storeSetFaderLevaOptionsStore);
    const faderLevaOptionsStore = useZustand((state) => state.fader.faderLevaOptionsStore);

    /* Create collective Leva store for general options: */
    const levaOptionsPanelStore = useCreateStore();
    useEffect(() => {
        storeSetFaderLevaOptionsStore(levaOptionsPanelStore);
    }, []);

    return (
        <div className='h-full w-full'>
            <div className='bg-red-500 px-1 text-slate-200'>Asset Panel</div>
            <div className='flex flex-col items-center py-1'>
                {arrayOfFaderAssetGroupTypes.map((groupType, idx) => {
                    return (
                        <div key={`${groupType} - ${idx}`} className='w-full'>
                            <div className='w-full self-start bg-slate-500 px-1 text-slate-200'>{groupType}</div>
                            <AssetGroups
                                assetGroups={currentScene.data.assetOrderByGroup}
                                groupType={groupType}
                                selectedAssetState={selectedAssetState}
                            />

                            <AddAsset groupType={groupType} scene={currentScene} />
                        </div>
                    );
                })}
            </div>

            <div>
                {faderLevaOptionsStore && <LevaOptions currentScene={currentScene} optionsStore={faderLevaOptionsStore} theme={theme} />}
            </div>
        </div>
    );
};

export default AssetPanel;

const LevaOptions = ({
    currentScene,
    optionsStore,
    theme,
}: {
    currentScene: FaderSceneType;
    optionsStore: StoreType;
    theme: LevaThemeType;
}) => {
    useControlsWrapperOptionsPanel(optionsStore, currentScene);

    return <LevaPanel store={optionsStore} theme={theme} titleBar={{ title: 'Options', drag: false }} flat fill hideCopyButton />;
};
