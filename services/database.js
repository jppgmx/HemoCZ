/**
 * @module services/database
 * Gerenciamento de conexão e operações do banco de dados SQLite (node:sqlite).
 * Requer Node.js >= 22.5.0
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const schemas = require('./schemas');

const dbBasePath = path.resolve(__dirname, '../data');
const dbFilePath = path.join(dbBasePath, 'app_database.db');
const rootDir = path.resolve(__dirname, '../');

if (!fs.existsSync(dbBasePath)) {
    fs.mkdirSync(dbBasePath, { recursive: true });
}

const db = new DatabaseSync(dbFilePath);
console.log('Connected to the SQLite database.');

// Registrar a função rdf como UDF no SQLite
db.function('rdf', (relativePath) => {
    const fullPath = path.resolve(path.join(rootDir, relativePath));
    return fs.readFileSync(fullPath);
});

// Initialize the database schema if necessary
Object.values(schemas.schemas).forEach((tableSchema) => {
    try {
        db.exec(tableSchema);
    } catch (err) {
        console.error('Error creating table:', err.message);
    }
});

// Insert default data
Object.entries(schemas.defaultInserts).forEach(([key, insertQuery]) => {
    console.log(`Inserting default data for ${key}...`);
    try {
        db.exec(insertQuery);
    } catch (err) {
        // Ignora erros de dados já existentes (UNIQUE constraint)
        if (!err.message.includes('UNIQUE constraint')) {
            console.error('Error inserting default data:', err.message);
        }
    }
});

module.exports = {
    /**
     * Obtém a instância do banco de dados SQLite.
     * @returns {DatabaseSync} A instância do banco de dados SQLite.
     */
    getDB: () => db,

    /**
     * Executa uma consulta SQL no banco de dados sem retornar resultados.
     * @param {string} query A consulta SQL a ser executada.
     * @param {Array<any>} params Os parâmetros para a consulta SQL.
     * @returns {{ changes: number, lastInsertRowid: number }} Resultado da execução.
     */
    run: (query, params = []) => {
        const stmt = db.prepare(query);
        return stmt.run(...params);
    },

    /**
     * Executa uma consulta SQL que retorna uma única linha.
     * @param {string} query A consulta SQL a ser executada.
     * @param {Array<any>} params Os parâmetros para a consulta SQL.
     * @returns {any} A linha retornada ou undefined.
     */
    get: (query, params = []) => {
        const stmt = db.prepare(query);
        return stmt.get(...params);
    },

    /**
     * Executa uma consulta SQL que retorna múltiplas linhas.
     * @param {string} query A consulta SQL a ser executada. 
     * @param {Array<any>} params Os parâmetros para a consulta SQL.
     * @returns {any[]} As linhas retornadas.
     */
    all: (query, params = []) => {
        const stmt = db.prepare(query);
        return stmt.all(...params);
    },

    /**
     * Executa uma consulta SQL e chama um callback para cada linha retornada.
     * @param {string} query A consulta SQL a ser executada.
     * @param {Array<any>} params Os parâmetros para a consulta SQL.
     * @param {(row: any) => void} callback O callback a ser chamado para cada linha.
     * @returns {number} O número de linhas processadas.
     */
    each: (query, params = [], callback) => {
        const rows = db.prepare(query).all(...params);
        rows.forEach(callback);
        return rows.length;
    }
}