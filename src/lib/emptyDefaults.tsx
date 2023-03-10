/** Used to feed default values onMount before backend data is dealt with */

import { FaderStoryAsset } from '../types/FaderTypes';

export const defaultAssetProperties: FaderStoryAsset['properties'] = {
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scale: 1, // TODO we're not doing anything with this to date?
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
};

export const defaultAssetData: FaderStoryAsset['data'] = {
    textColor: '#ffffff' /* non-empty so leva understands this as a color field */,
    nextSceneId: '',
    legacyInteractiveSize: true,
    headline: '',
    frameOpacity: 1,
    frameOn: false,
    frameColor: '#888888' /* as above ^ */,
    cardWidth: 1,
    cardLevel: 1,
    cardHeight: 1,
    body: '',
    backgroundOpacity: 1,
    backgroundOn: false,
    backgroundColor: '#222222' /* as above ^ */,
};

export const defaultAssetDisplay: FaderStoryAsset['display'] = {
    caption: '',
    linkedBackendIds: [],
    showInteractive: false,
};
