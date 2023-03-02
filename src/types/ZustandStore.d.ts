import { FaderBackendAsset, FaderStory } from './FaderTypes';

export interface ZustandState {
    siteData: {
        apiAuthToken: string;
    };
    methods: {
        /** Sets Api Token from Api call */
        storeSetApiAuthToken: (access_token: string) => void;
        /** Sets Project */
        storeSetProject: (story: FaderStory) => void;
        /** Store Assets associated with Scene */
        storeSetProjectAssets: (assets: Record<string, FaderBackendAsset>) => void;
    };
    project: FaderStory | undefined;
    faderStoryData: {
        currentAssets: Record<string, FaderBackendAsset>;
    };
}
