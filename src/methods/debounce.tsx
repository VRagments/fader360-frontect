function debounce(func: { (): void; apply?: any }, timeout = 300) {
    let timer: string | number | NodeJS.Timeout | undefined;
    console.log('%c[debounce]', 'color: #1e057d', `func, timer, timeout :`, func, timer, timeout);

    return (...args: any) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            // @ts-expect-error ...
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            func.apply(this, args);
        }, timeout);
    };
}

// function saveInput() {
//     console.log('Saving data');
// }
// const processChange = debounce(() => saveInput());

export default debounce;
