export default () => {
    return /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(
        global.navigator.appVersion
    );
};
