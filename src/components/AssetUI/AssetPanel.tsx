import { XCircleIcon } from '@heroicons/react/24/solid';
import { button, folder, LevaPanel, useControls, useCreateStore } from 'leva';
import { useCallback } from 'react';
import { wrappers_AddNewAssetToSceneStoreAndRemote } from '../../lib/api_and_store_wrappers';
import { groupAndTypeLinks } from '../../lib/createAsset';
import { arrayOfFaderAssetGroupTypes } from '../../lib/defaults';
import useZustand from '../../lib/zustand/zustand';
import { getSortedBackendAssetsByType } from '../../lib/methods/faderHelpers';
import { generateRecordOfNamedBackendAssetIds } from '../../lib/hooks/useLevaControls';
import { levaThemeValues, levaValuesForTw } from '../../style/levaTheme';
import { FaderAssetGroupType, FaderBackendAsset, FaderSceneType } from '../../types/FaderTypes';
import AddAsset from './AddAsset';
import AssetGroup from './AssetGroup';

type AssetPanelProps = {
    setOpenPanel: React.Dispatch<React.SetStateAction<'' | 'assets' | 'options'>>;
    currentScene: FaderSceneType;
    selectedAssetState: [string, React.Dispatch<React.SetStateAction<string>>];
    addAssetPanelState: [
        {
            visible: boolean;
            assetGroupType: string;
        },
        React.Dispatch<
            React.SetStateAction<{
                visible: boolean;
                assetGroupType: string;
            }>
        >
    ];
};
/** Panel that lists a `FaderScene`'s associated `FaderSceneAsset`'s, and allows adding new `FaderSceneAsset`'s via `<AddAsset>` */
const AssetPanel = ({ setOpenPanel, currentScene, selectedAssetState, addAssetPanelState }: AssetPanelProps) => {
    return (
        <>
            <div className={'h-full w-full font-mono'}>
                <div
                    className={
                        'flex flex-row items-center justify-center bg-opacity-[0.85] px-1' +
                        levaValuesForTw.colors.elevation1.bg +
                        levaValuesForTw.colors.highlight1.text +
                        levaValuesForTw.sizes.titleBarHeight +
                        levaValuesForTw.fontSizes.root
                    }
                >
                    <span className='w-full text-center'>Asset Panel</span>
                    <XCircleIcon
                        className='ml-auto mr-1 h-8 w-8 cursor-pointer fill-slate-200 p-1 hover:fill-slate-500'
                        onClick={() => {
                            setOpenPanel('');
                        }}
                    />
                </div>
                <div className='flex flex-col items-center py-1'>
                    {arrayOfFaderAssetGroupTypes.map((groupType, idx) => {
                        /* WARN Display of '360' Group disabled for now (non-functional): */
                        if (groupType === '360') {
                            return null;
                        } else {
                            return (
                                <div
                                    key={`${groupType} - ${idx}`}
                                    className={'relative flex w-full flex-col items-center' + levaValuesForTw.fontSizes.root}
                                >
                                    <div
                                        className={
                                            'w-full self-start px-1 pl-2' +
                                            levaValuesForTw.colors.elevation2.bg +
                                            levaValuesForTw.colors.folderTextColor.text
                                        }
                                    >
                                        {groupType}
                                    </div>
                                    <AssetGroup
                                        assetGroup={currentScene.data.assetOrderByGroup[groupType]}
                                        sceneAssets={currentScene.data.assets}
                                        selectedAssetState={selectedAssetState}
                                    />

                                    <AddAsset groupType={groupType} addAssetPanelState={addAssetPanelState} />
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        </>
    );
};

export default AssetPanel;

type AddAssetPanelProps = {
    currentScene: FaderSceneType;
    addAssetPanelState: [
        {
            visible: boolean;
            assetGroupType: string;
        },
        React.Dispatch<
            React.SetStateAction<{
                visible: boolean;
                assetGroupType: string;
            }>
        >
    ];
};
export const AddAssetPanel = ({ currentScene, addAssetPanelState }: AddAssetPanelProps) => {
    const faderBackendAssets = useZustand((state) => state.fader.faderStoryBackendAssets);
    const [addAssetPanelOpts, setAddAssetPanelOpts] = addAssetPanelState;

    const addAssetLevaStore = useCreateStore();

    const namedBackendAssetIdRecordByType = useCallback(
        (backendAssets: Record<string, FaderBackendAsset>, groupType: FaderAssetGroupType) => {
            const type = groupAndTypeLinks[groupType];
            if (type) {
                const sortedBackendAssetsByType = getSortedBackendAssetsByType(backendAssets)[type];
                const namedRecord = generateRecordOfNamedBackendAssetIds(sortedBackendAssetsByType);
                return namedRecord;
            }
        },
        [faderBackendAssets, addAssetPanelOpts.assetGroupType]
    );

    useControls(
        {
            // @ts-expect-error ...
            'backendAssetSelect': {
                label: `Select ${addAssetPanelOpts.assetGroupType} Asset to assign to Scene`,
                options: namedBackendAssetIdRecordByType(faderBackendAssets, addAssetPanelOpts.assetGroupType as FaderAssetGroupType),
                onChange: (_val) => {
                    //
                },
                transient: false,
                order: 0,
                render: () => addAssetPanelOpts.assetGroupType !== 'TextCard',
            },
            'Add to Scene': folder(
                {
                    'Add Asset to Scene': button(
                        (get) => {
                            const backendAssetId = get('backendAssetSelect') as FaderBackendAsset['id'];

                            wrappers_AddNewAssetToSceneStoreAndRemote(
                                faderBackendAssets[backendAssetId],
                                addAssetPanelOpts.assetGroupType as FaderAssetGroupType,
                                currentScene
                            );
                            setAddAssetPanelOpts({ visible: false, assetGroupType: '' });
                        },
                        { disabled: false }
                    ),
                },
                { render: (get) => (get('backendAssetSelect') || addAssetPanelOpts.assetGroupType == 'TextCard' ? true : false), order: 1 }
            ),
        },
        { store: addAssetLevaStore },
        [addAssetPanelOpts]
    );

    return (
        <div className='pointer-events-auto absolute bottom-1/2 left-1/2 right-1/2 z-[1010] w-max rounded-md bg-slate-500 bg-opacity-75 drop-shadow-2xl'>
            <LevaPanel
                store={addAssetLevaStore}
                theme={levaThemeValues}
                titleBar={{ drag: false, title: `Add ${addAssetPanelOpts.assetGroupType}`, filter: false }}
                flat
                hideCopyButton
                oneLineLabels
                fill
            />
            {/* Needs to be absolutely positioned atop of Leva's title bar (we have no direct access to their html): */}
            <XCircleIcon
                className='absolute right-0 top-0 mr-1 h-8 w-8 cursor-pointer fill-slate-200 p-1 hover:fill-slate-500'
                onClick={() => {
                    setAddAssetPanelOpts({ visible: false, assetGroupType: '' });
                }}
            />
        </div>
    );
};
