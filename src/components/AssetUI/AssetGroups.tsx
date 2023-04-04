import { FaderAssetGroupType, FaderSceneDataType } from '../../types/FaderTypes';

type AssetGroupsProps = {
    assetGroups: FaderSceneDataType['assetOrderByGroup'];
    groupType: FaderAssetGroupType;
    selectedAssetState: [string, React.Dispatch<React.SetStateAction<string>>];
};
const AssetGroups = ({ assetGroups, groupType, selectedAssetState }: AssetGroupsProps) => {
    const [selectedAssetId, setSelectedAssetId] = selectedAssetState;

    const standardClasses = 'cursor-pointer self-start px-2 text-sm hover:bg-orange-600';
    const inactiveClasses = 'bg-slate-200';
    const activeClasses = 'bg-blue-500';

    if (!assetGroups || !(groupType in assetGroups)) {
        return null;
    }

    return (
        <>
            {assetGroups[groupType]?.map((assetId, idx) => {
                return (
                    <div
                        key={`${assetId}-${idx}`}
                        className={
                            selectedAssetId === assetId ? `${standardClasses} ${activeClasses}` : `${standardClasses} ${inactiveClasses}`
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
                        {assetId}
                    </div>
                );
            })}
        </>
    );
};

export default AssetGroups;
