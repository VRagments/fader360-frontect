import { levaValuesForTw } from '../../style/levaTheme';
import { FaderAssetGroupType, FaderSceneDataType } from '../../types/FaderTypes';

type AssetGroupProps = {
    assetGroup: FaderSceneDataType['assetOrderByGroup'][FaderAssetGroupType];
    sceneAssets: FaderSceneDataType['assets'];
    selectedAssetState: [string, React.Dispatch<React.SetStateAction<string>>];
};
const AssetGroup = ({ assetGroup, sceneAssets, selectedAssetState }: AssetGroupProps) => {
    const [selectedAssetId, setSelectedAssetId] = selectedAssetState;

    const standardClasses =
        'cursor-pointer self-start px-2 hover:bg-orange-400 rounded-sm border-2 mt-1 mr-4 mx-1 w-full' + levaValuesForTw.fontSizes.root;
    const inactiveClasses = 'bg-slate-200 border-slate-200 hover:border-orange-600';
    const activeClasses = 'bg-orange-500 border-orange-600 text-slate-200';

    if (!assetGroup) {
        return null;
    } else {
        return (
            <>
                {assetGroup.map((assetId, idx) => {
                    return (
                        <div
                            key={`${assetId}-${idx}`}
                            className={
                                selectedAssetId === assetId
                                    ? `${standardClasses} ${activeClasses}`
                                    : `${standardClasses} ${inactiveClasses}`
                            }
                            onClick={() => {
                                /* Toggle wether active */
                                if (selectedAssetId === assetId) {
                                    setSelectedAssetId('');
                                } else {
                                    setSelectedAssetId(assetId);
                                }
                            }}
                        >
                            {sceneAssets[assetId].data.headline && sceneAssets[assetId].data.headline}
                            {sceneAssets[assetId].data.name && ` (${sceneAssets[assetId].data.name})`}
                        </div>
                    );
                })}
            </>
        );
    }
};

export default AssetGroup;
