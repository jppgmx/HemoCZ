const ls = require('node-localstorage')

let STORAGE_PATH;
if(process.env.NODE_ENV === 'production') {
    STORAGE_PATH = './dist/storage'
} else {
    STORAGE_PATH = './tmp/storage'
}

/**
 * Retorna uma interface semelhante ao localStorage para persistência de dados em arquivos locais.
 * Garante que múltiplas instâncias para o mesmo local não sejam criadas.
 *
 * @param {string} location - Caminho do diretório onde os dados serão armazenados.
 * @returns {{
 *   setItem: (key: string, value: any) => void,
 *   getItem: (key: string) => any,
 *   removeItem: (key: string) => void,
 *   clear: () => void,
 *   key: (index: number) => string | null,
 *   length: () => number,
 *   has: (key: string) => boolean
 * }} Interface para manipulação dos dados persistidos.
 */
function getLocalStorage(location) {
    /** @type {ls.LocalStorage} */
    const localStorage = new ls.LocalStorage(STORAGE_PATH + '/' + location);

    return {
        setItem: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
        getItem: (key) => {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        },
        removeItem: (key) => localStorage.removeItem(key),
        clear: () => localStorage.clear(),
        key: (index) => localStorage.key(index),
        length: () => localStorage.length,
        has: (key) => localStorage.getItem(key) !== null
    };
}

module.exports = getLocalStorage;
