/* Api Types */

export interface FaderStoryType {
    author: null | string;
    created_at: string; // '2023-01-25 11:26:13'
    custom_colorscheme: object;
    custom_font: string;
    custom_logo: string;
    custom_player_settings: object;
    data: FaderStoryDataType;
    id: string;
    last_updated_at: string; // '2023-01-25 13:43:51'
    name: string;
    preview_image: string;
    primary_asset_lease_id: string;
    squared_image: string;
    thumbnail_image: string;
    updated_at: string; // '2023-01-25 13:43:51'
    user_display_name: string;
    visibility: string; // 'discoverable'
}

export interface FaderStoryDataType {
    assetBlueprints: Record<string, FaderSceneAssetBlueprint>;
    sceneOrder: FaderSceneType['id'][];
    ui: {
        nextTutorialStep: number;
        selectedSceneId: string;
        showEnvironmentInfo: boolean;
        showSceneInfo: boolean;
        userSelectedThumbnail: boolean;
    };
    /** Backend Id's */
    uploadedAssetIds: string[];
    version: number;
}

export interface FaderSceneType {
    created_at: string;
    data: FaderSceneDataType;
    duration: number;
    id: string;
    name: string;
    navigatable: boolean; // former "jumpTo"
    preview_image: string | null;
    primary_asset_lease_id: string | null;
    project_id: FaderStoryType['id'];
    thumbnail_image: string | null;
    updated_at: string;
}

export interface FaderSceneDataType {
    /** Local asset guid's */
    assetIds: FaderSceneAssetType['id'][];
    assetOrderByGroup: Record<FaderAssetGroupType, FaderSceneAssetType['id'][]>;
    assets: Record<string, FaderSceneAssetType>;
    environment: {
        enableGroundIn360: boolean;
        positionY: number;
        /** If `preset == ''` then Env is off, if `preset` is a UUID, Env is set to this UUID's `FaderBackendAsset.id` */
        preset: string;
        radius: number;
        seed: number;
    };
    ui: {
        selectedAssetIdByGroup: Record<string, FaderAssetGroupType>;
        selectedAssetGroup: FaderAssetGroupType;
    };
}

export interface FaderSceneAssetType {
    backendId: FaderBackendAsset['id'];
    data: {
        backgroundColor: string;
        backgroundOn: boolean;
        backgroundOpacity: number;
        body: string;
        cardHeight: number;
        cardLevel: number;
        cardWidth: number;
        frameColor: string;
        frameOn: boolean;
        frameOpacity: number;
        headline: string;
        legacyInteractiveSize: boolean;
        name: string /* Added by myself to store name from FaderBackendAsset */;
        nextSceneId: string;
        textColor: string;
    };
    display: {
        caption: string; // This will be superseded by 'headline', or rather 'body'
        linkedBackendIds: string[];
        showInteractive: boolean;
    };
    group: FaderAssetGroupType;
    /** Local guid */
    id: string;
    properties: {
        positionX: number;
        positionY: number;
        positionZ: number;
        rotationX: number;
        rotationY: number;
        rotationZ: number;
        scale: number;
        scaleX: number;
        scaleY: number;
        scaleZ: number;
    };
    type: FaderAssetType;
}

// Not sure what purpose these serve tbh
export interface FaderSceneAssetBlueprint {
    backendId: FaderBackendAsset['id'];
    data: {
        headline: string;
        body: string;
    };
    /** Local guid */
    id: FaderSceneAssetType['id']; // or 'string'? Does this refer to the FaderSceneAssetType id or is it a separate id?
    type: FaderAssetType;
}

// TODO should an entry for FaderAssetGroupType or at least FaderAssetType be in here?
export interface FaderBackendAsset {
    attributes: {
        duration: number;
        file_size: number;
        height: number;
        width: number;
    };
    /** Backend Id */
    id: string;
    inserted_at: string; // some Date format actually?
    lowres_image: string | null;
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

/* Renamed "Interactive" to "SceneLink" */
export type FaderAssetGroupType = 'Video2D' | 'SceneLink' | 'Image2D' | 'TextCard' | 'Audio' | '360';

export type FaderAssetType = 'Video' | 'Audio' | 'TextCard' | 'Image' | 'SceneLink';
