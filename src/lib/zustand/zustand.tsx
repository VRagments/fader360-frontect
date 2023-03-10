import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ZustandState } from '../../types/ZustandStore';

/* TODO Prepare repo for production / dev environments respectively?
 * const useZustand = process.env.NODE_ENV === 'production' ? create(createState) : create(log(createState)) */

/** Our Store */
const useZustand = create<ZustandState>()(
    devtools(
        immer((set, _get) => {
            const initialState: ZustandState = {
                methods: {
                    storeSetApiAuthToken: (access_token) => {
                        set(
                            (draftState) => {
                                draftState.siteData.apiAuthToken = access_token;
                            },
                            false,
                            'storeSetApiAuthToken'
                        );
                    },
                    storeSetProject: (story) => {
                        set(
                            (draftState) => {
                                draftState.project = story;
                            },
                            false,
                            'storeSetProject'
                        );
                    },
                    storeSetProjectAssets: (assets) => {
                        set((draftState) => {
                            draftState.faderStoryData.backendAssets = assets;
                        });
                    },
                },
                siteData: {
                    apiAuthToken: '',
                },
                project: undefined,
                faderStoryData: {
                    backendAssets: {},
                },
            };

            return initialState;
        })
    )
);

export default useZustand;
