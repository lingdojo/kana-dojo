import useCrazyModeStore from '../store/useCrazyModeStore';

export const useCrazyModeTrigger = () => {
    const isCrazyMode = useCrazyModeStore(state => state.isCrazyMode);
    const randomize = useCrazyModeStore(state => state.randomize);

    const trigger = () => {
        if (isCrazyMode) {
            randomize();
        }
    };

    return { trigger };
};
