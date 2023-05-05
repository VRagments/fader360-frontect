import { FaderAssetGroupType } from '../../types/FaderTypes';

type AddAssetProps = {
    groupType: FaderAssetGroupType;
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
const AddAsset = ({ groupType, addAssetPanelState }: AddAssetProps) => {
    const [, setAddAssetPanelVisible] = addAssetPanelState;

    return (
        <>
            <div
                className='my-1  cursor-pointer rounded-md bg-slate-700 px-2 py-1 text-center text-xs text-slate-200 '
                onClick={(_ev) => {
                    setAddAssetPanelVisible({ visible: true, assetGroupType: groupType });
                }}
            >
                Add {groupType} to Scene!
            </div>
        </>
    );
};

export default AddAsset;
