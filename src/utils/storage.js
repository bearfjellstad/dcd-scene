let stores = {
    local: null,
    session: null,
};
const defaultType = 'local';

export class LocalStorageMock {
    constructor() {
        this.items = {};
    }

    getItem(key) {
        return this.items[key] || null;
    }

    setItem(key, data) {
        this.items[key] = data;
    }

    removeItem(key) {
        this.items[key] = null;
    }
}

try {
    stores.local = global.localStorage;
    stores.session = global.sessionStorage;
} catch (err) {
    console.log('localstorage not available', err);
    stores.local = new LocalStorageMock();
    stores.session = new LocalStorageMock();
}

export default {
    read(key, type = defaultType) {
        let fromStorage = null;

        try {
            fromStorage =
                stores[type].getItem(key) &&
                JSON.parse(stores[type].getItem(key));
        } catch (err) {
            console.log(err);
        }

        return fromStorage;
    },

    write(key, data, type = defaultType) {
        if (!data) return data;

        try {
            stores[type].setItem(key, JSON.stringify(data));
        } catch (err) {
            console.log(err);
        }

        return data;
    },

    destroy(key, type = defaultType) {
        try {
            stores[type].removeItem(key);
        } catch (err) {
            console.log(err);
        }
    },
};
