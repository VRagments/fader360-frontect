import { levaValuesForTw } from '../../style/levaTheme';
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
                className={
                    'my-1 cursor-pointer rounded-md px-2 py-1 text-center text-slate-200 hover:bg-orange-400' +
                    levaValuesForTw.fontSizes.root +
                    levaValuesForTw.colors.highlight2.text +
                    levaValuesForTw.colors.elevation3.bg
                }
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
