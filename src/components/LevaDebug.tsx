import { folder, LevaPanel, useControls, useCreateStore } from 'leva';
import { useEffect } from 'react';
import { LevaThemeType } from '../style/levaTheme';

type LevaDebugProps = {
    setTheme: React.Dispatch<React.SetStateAction<LevaThemeType>>;
};
/**
 * Debug-enabled Component that allows us to edit Leva's theme (passing changes back up to parent component via useState), as well as showcasing use of several split Leva stores
 */
const LevaDebug = (props: LevaDebugProps) => {
    const { setTheme } = props;

    const colorsStore = useCreateStore();
    const radiiStore = useCreateStore();
    const spaceStore = useCreateStore();
    const fontSizesStore = useCreateStore();
    const sizesStore = useCreateStore();
    const borderWidthsStore = useCreateStore();
    const fontWeightsStore = useCreateStore();

    const colors = useControls(
        {
            colors: folder({
                elevation1: '#292D39',
                elevation2: '#181C20',
                elevation3: '#373C4B',
                vivid1: '#ffcc00',
                accent1: '#0066DC',
                accent2: '#007BFF',
                accent3: '#3C93FF',
                highlight1: '#535760',
                highlight2: '#8C92A4',
                highlight3: '#FEFEFE',
            }),
        },
        { store: colorsStore }
    );

    const radii = useControls(
        {
            radii: folder({
                xs: '2px',
                sm: '3px',
                lg: '10px',
            }),
        },
        { store: radiiStore }
    );

    const space = useControls(
        {
            space: folder({
                sm: '6px',
                md: '10px',
                rowGap: '7px',
                colGap: '7px',
            }),
        },
        { store: spaceStore }
    );

    const fontSizes = useControls(
        {
            fontSizes: folder({
                root: '11px',
            }),
        },
        { store: fontSizesStore }
    );

    const sizes = useControls(
        {
            sizes: folder({
                rootWidth: '280px',
                controlWidth: '160px',
                scrubberWidth: '8px',
                scrubberHeight: '16px',
                rowHeight: '24px',
                folderHeight: '20px',
                checkboxSize: '16px',
                joystickWidth: '100px',
                joystickHeight: '100px',
                colorPickerWidth: '160px',
                colorPickerHeight: '100px',
                monitorHeight: '60px',
            }),
        },
        { store: sizesStore }
    );

    const borderWidths = useControls(
        {
            borderWidths: folder({
                root: '0px',
                input: '1px',
                focus: '1px',
                hover: '1px',
                active: '1px',
                folder: '1px',
            }),
        },
        { store: borderWidthsStore }
    );

    const fontWeights = useControls(
        {
            fontWeights: folder({
                label: { value: 'normal', options: ['bold', 'light'] },
                folder: { value: 'normal', options: ['bold', 'light'] },
                button: { value: 'normal', options: ['bold', 'light'] },
            }),
        },
        { store: fontWeightsStore }
    );

    const themeObj = {
        colors,
        radii,
        space,
        fontSizes,
        sizes,
        borderWidths,
        fontWeights,
    };

    useEffect(() => {
        setTheme(themeObj);

        /* stringify object to monitor changes (useEffect dependency's comparison is shallow by default) */
    }, [JSON.stringify(themeObj)]);

    return (
        <>
            <LevaPanel titleBar={{ title: 'Theme Colors', drag: false }} hideCopyButton collapsed fill flat store={colorsStore} />
            <LevaPanel titleBar={{ title: 'Theme Radiis', drag: false }} hideCopyButton collapsed fill flat store={radiiStore} />
            <LevaPanel titleBar={{ title: 'Theme Spaces', drag: false }} hideCopyButton collapsed fill flat store={spaceStore} />
            <LevaPanel titleBar={{ title: 'Theme Font Sizes', drag: false }} hideCopyButton collapsed fill flat store={fontSizesStore} />
            <LevaPanel titleBar={{ title: 'Theme Sizes', drag: false }} hideCopyButton collapsed fill flat store={sizesStore} />
            <LevaPanel
                titleBar={{ title: 'Theme BorderWidths', drag: false }}
                hideCopyButton
                collapsed
                fill
                flat
                store={borderWidthsStore}
            />
            <LevaPanel
                titleBar={{ title: 'Theme Font Weights', drag: false }}
                hideCopyButton
                collapsed
                fill
                flat
                store={fontWeightsStore}
            />
        </>
    );
};

export default LevaDebug;
