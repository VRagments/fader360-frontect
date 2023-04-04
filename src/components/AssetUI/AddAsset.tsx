import { wrappers_AddNewAssetToSceneStoreAndRemote } from '../../lib/api_and_store_wrappers';
import { FaderAssetGroupType, FaderSceneType } from '../../types/FaderTypes';

type AddAssetProps = {
    groupType: FaderAssetGroupType;
    scene: FaderSceneType;
};
const AddAsset = ({ groupType, scene }: AddAssetProps) => {
    return (
        <div
            className='my-1 max-w-max cursor-pointer rounded-md bg-slate-700 px-2 py-1 text-center text-xs text-slate-200 '
            onClick={(_ev) => {
                wrappers_AddNewAssetToSceneStoreAndRemote(groupType, scene);
            }}
        >
            Add {groupType} Story-Asset to Scene!
        </div>
    );
};

export default AddAsset;
