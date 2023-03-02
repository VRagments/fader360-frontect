/* Api Types */
export interface FaderStory {
    visibility: string; // 'discoverable'
    user_display_name: string;
    updated_at: string; // '2023-01-25 13:43:51'
    thumbnail_image: string;
    squared_image: string;
    primary_asset_lease_id: string;
    preview_image: string;
    name: string;
    last_updated_at: string; // '2023-01-25 13:43:51'
    id: string;
    data: {
        version: number;
        uploadedAssetIds: string[];
        ui: {
            userSelectedThumbnail: boolean;
            showSceneInfo: boolean;
            showEnvironmentInfo: boolean;
            selectedSceneId: string;
            nextTutorialStep: number;
        };
        scenes: Record<string, FaderScene>;
        sceneOrder: string[];
        assets: Record<string, StoryAsset>;
        assetBlueprints: Record<string, StoryAssetBlueprint>;
    };
    custom_player_settings: object;
    custom_logo: string;
    custom_icon_video: string;
    custom_icon_image: string;
    custom_icon_audio: string;
    custom_font: string;
    custom_colorscheme: object;
    created_at: string; // '2023-01-25 11:26:13'
    author: null | string;
}

export interface FaderScene {
    ui: {
        selectedAssetIdByGroup: AssetsKeys;
        selectedAssetGroup: keyof AssetsKeys;
    };
    primary_asset_id: string;
    name: string;
    jumpTo: boolean;
    id: string;
    environment: {
        seed: number;
        preset: string;
        positionY: number;
        enableGroundIn360: boolean;
    };
    duration: number;
    assetOrderByGroup: Partial<Record<keyof AssetsKeys, string[]>>;
    assetIds: string[];
}

export interface StoryAsset {
    type: string; // 'Image'
    properties: {
        scaleZ: number;
        scaleY: number;
        scaleX: number;
        scale: number;
        rotationZ: number;
        rotationY: number;
        rotationX: number;
        positionZ: number;
        positionY: number;
        positionX: number;
    };
    id: string;
    group: keyof AssetsKeys;
    display: {
        showInteractive: boolean;
        linkedBackendIds: string[];
        caption: string;
    };
    data: {
        textColor: string;
        nextSceneId: string;
        legacyInteractiveSize: boolean;
        headline: string;
        frameOpacity: number;
        frameOn: boolean;
        frameColor: string;
        cardWidth: number;
        cardLevel: number;
        cardHeight: number;
        body: string;
        backgroundOpacity: number;
        backgroundOn: boolean;
        backgroundColor: string;
    };
    backendId: string;
}

// Not sure what purpose these serve tbh
export interface StoryAssetBlueprint {
    type: string; // 'Video'
    id: string;
    data: {
        headline: string;
        body: string;
    };
    backendId: string;
}

export interface FaderBackendAsset {
    attributes: {
        duration: number;
        file_size: number;
        height: number;
        width: number;
    };
    id: string;
    inserted_at: string; // some Date format actually?
    lowres_image: string;
    media_type: string; // 'image/jpeg'
    midres_image: string;
    name: string;
    preview_image: string | null;
    squared_image: string;
    static_url: string;
    status: string;
    thumbnail_image: string;
    updated_at: string; // some Date format actually?
}

type AssetsKeys = { 'Video2D'?: string; 'Interactive'?: string; 'Image2D'?: string; 'TextCard'?: string; 'Audio'?: string; '360'?: string };
