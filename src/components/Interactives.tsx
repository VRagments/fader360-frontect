import { FaderStoryAsset } from '../types/FaderTypes';

type InteractivesProps = {
    sceneInteractiveAssets: FaderStoryAsset[];
};
const Interactives = (props: InteractivesProps) => {
    const interactiveAssets = props.sceneInteractiveAssets;

    if (!interactiveAssets) {
        return <></>;
    }

    return <></>;
};

export default Interactives;
