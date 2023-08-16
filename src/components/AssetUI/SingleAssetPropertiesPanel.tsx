import { LevaPanel } from 'leva';
import { useMemo } from 'react';
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

    const activeLevaPanelOptionsMemo = useMemo(() => {
        const filteredLevaPanel = faderLevaPanels.filter((levaPanel) => levaPanel.id === selectedAssetId)[0];
        return filteredLevaPanel;
    }, [selectedAssetId]);

    return activeLevaPanelOptionsMemo ? (
        <LevaPanel
            key={`${activeLevaPanelOptionsMemo.id}`}
            store={activeLevaPanelOptionsMemo.store}
            theme={theme}
            titleBar={{
                title: `${activeLevaPanelOptionsMemo.group} - ${activeLevaPanelOptionsMemo.id}`,
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
