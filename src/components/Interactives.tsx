import { StoryAsset } from '../types/FaderTypes';

type InteractivesProps = {
    sceneInteractiveAssets: StoryAsset[];
};
const Interactives = (props: InteractivesProps) => {
    const interactiveAssets = props.sceneInteractiveAssets;

    if (!interactiveAssets) {
        return <></>;
    }

    return <></>;
};

export default Interactives;
