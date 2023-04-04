/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars,  @typescript-eslint/no-unsafe-member-access */
import hexRgb from 'hex-rgb';
import resolveConfig from 'tailwindcss/resolveConfig';
import { hexBgColorToTwRgbColor } from '../methods/colorHelpers';
import tailwindConfig from '../tailwind.config.js';

// @ts-expect-error "Property 'colors' does not exist on type 'UnwrapResolvables'"
const tailwindConfigColors = resolveConfig(tailwindConfig).theme.colors;

// background-color: rgb(100 116 139 / var(--tw-bg-opacity));

/** OUR default values. Originals here: https://github.com/pmndrs/leva/blob/main/packages/leva/src/styles/stitches.config.ts */
export const levaThemeValues: LevaThemeType = {
    colors: {
        elevation1: hexBgColorToTwRgbColor(tailwindConfigColors.slate['700'] as string), // title bg
        elevation2: hexBgColorToTwRgbColor(tailwindConfigColors.slate['500'] as string), // panels bg
        elevation3: hexBgColorToTwRgbColor(tailwindConfigColors.slate['800'] as string), // input fields
        vivid1: tailwindConfigColors.red['500'],
        accent1: tailwindConfigColors.slate['100'], // border color onMouseOver
        accent2: tailwindConfigColors.slate['200'], // sliders
        accent3: tailwindConfigColors.slate['50'], // slider onDrag
        highlight1: tailwindConfigColors.slate['200'], // Title font
        highlight2: tailwindConfigColors.slate['300'], // Regular font
        highlight3: tailwindConfigColors.slate['400'], // Sub-header Font
    },
    radii: {
        xs: '2px',
        sm: '3px',
        lg: '10px',
    },
    space: {
        sm: '6px',
        md: '10px',
        rowGap: '7px',
        colGap: '7px',
    },
    fontSizes: {
        root: '11px',
    },
    sizes: {
        rootWidth: '400px',
        controlWidth: '240px',
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
    },
    borderWidths: {
        root: '0px',
        input: '1px',
        focus: '1px',
        hover: '1px',
        active: '1px',
        folder: '1px',
    },
    fontWeights: {
        label: 'normal',
        folder: 'normal',
        button: 'normal',
    },
};

export type LevaThemeType = {
    colors: {
        elevation1: string;
        elevation2: string;
        elevation3: string;
        vivid1: string;
        accent1: string;
        accent2: string;
        accent3: string;
        highlight1: string;
        highlight2: string;
        highlight3: string;
    };
    radii: {
        xs: string;
        sm: string;
        lg: string;
    };
    space: {
        sm: string;
        md: string;
        rowGap: string;
        colGap: string;
    };
    fontSizes: {
        root: string;
    };
    sizes: {
        rootWidth: string;
        controlWidth: string;
        scrubberWidth: string;
        scrubberHeight: string;
        rowHeight: string;
        folderHeight: string;
        checkboxSize: string;
        joystickWidth: string;
        joystickHeight: string;
        colorPickerWidth: string;
        colorPickerHeight: string;
        monitorHeight: string;
    };
    borderWidths: {
        root: string;
        input: string;
        focus: string;
        hover: string;
        active: string;
        folder: string;
    };
    fontWeights: {
        folder: string;
        label: string;
        button: string;
    };
};
