import { LevaPanel } from 'leva';
import useZustand from '../../lib/zustand/zustand';
import { LevaThemeType } from '../../style/levaTheme';

type SingleAssetPropertiesPanelProps = {
    selectedAssetState: [string, React.Dispatch<React.SetStateAction<string>>];
    theme: LevaThemeType;
    position: {
        x: number;
        y: number;
    };
};
const SingleAssetPropertiesPanel = ({ selectedAssetState, theme, position }: SingleAssetPropertiesPanelProps) => {
    const [selectedAssetId] = selectedAssetState;
    const faderLevaPanels = useZustand((state) => state.fader.faderLevaPanels);

    const [activeLevaPanelOptions] = faderLevaPanels.filter((levaPanel) => levaPanel.id === selectedAssetId);

    return activeLevaPanelOptions ? (
        <LevaPanel
            key={`${activeLevaPanelOptions.id}`}
            store={activeLevaPanelOptions.store}
            theme={theme}
            titleBar={{
                title: `${activeLevaPanelOptions.group} - ${activeLevaPanelOptions.id}`,
                drag: false,
                position: {
                    x: position.x,
                    y: position.y,
                },
            }}
            flat
            hideCopyButton
        />
    ) : null;
};

export default SingleAssetPropertiesPanel;
