import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ZustandState } from '../types/GlobalTypes';

/* TODO Prepare repo for production / dev environments respectively?
 * const useZustand = process.env.NODE_ENV === 'production' ? create(createState) : create(log(createState)) */

const useZustand = create<ZustandState>()(
    devtools(
        immer((_set, _get) => {
            const initialState: ZustandState = {
                methods: {},
                siteData: {},
            };

            return initialState;
        })
    )
);

export default useZustand;
