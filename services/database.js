const sq3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const schemas = require('./schemas');
const { each } = require('chart.js/helpers');

const dbBasePath = path.resolve(__dirname, '../data');
const dbFilePath = path.join(dbBasePath, 'app_database.db')

if(!fs.existsSync(dbBasePath)) {
    fs.mkdirSync(dbBasePath, { recursive: true });
}

let db = new sq3.Database(dbFilePath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }

    // Initialize the database schema if necessary
    Object.values(schemas.schemas).forEach((tableSchema) => {
        db.run(tableSchema, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            }
        });
    });

    let adminCheckQuery = `SELECT COUNT(*) as count FROM user WHERE username = ?`;
    db.get(adminCheckQuery, ['admin'], (err, row) => {
        if (err) {
            console.error('Error checking for admin user:', err.message);
        } else if (row.count === 0) {
            db.run(schemas.defaultInserts.adminUserInsert, (err) => {
                if (err) {
                    console.error('Error inserting admin user:', err.message);
                } else {
                    console.log('Admin user inserted.');
                }
            });
        }
    });
});

module.exports = {
    /**
     * Obtém a instância do banco de dados SQLite.
     * @returns A instância do banco de dados SQLite.
     */
    getDB: () => db,

    /**
     * Executa uma consulta SQL no banco de dados sem retornar resultados.
     * @param {string} query A consulta SQL a ser executada.
     * @param {Array} params Os parâmetros para a consulta SQL.
     * @returns {Promise} Uma Promise que resolve quando a consulta é concluída.
     */
    run: async (query, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(query, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        });
    },

    /**
     * Executa uma consulta SQL que retorna uma única linha.
     * @param {string} query A consulta SQL a ser executada.
     * @param {Array} params Os parâmetros para a consulta SQL.
     * @returns {Promise} Uma Promise que resolve com a linha retornada.
     */
    get: async (query, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    },

    /**
     * Executa uma consulta SQL que retorna múltiplas linhas.
     * @param {string} query A consulta SQL a ser executada. 
     * @param {Array} params Os parâmetros para a consulta SQL.
     * @returns {Promise} Uma Promise que resolve com as linhas retornadas.
     */
    all: async (query, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    },

    /**
     * Executa uma consulta SQL e chama um callback para cada linha retornada.
     * @param {string} query A consulta SQL a ser executada.
     * @param {Array} params Os parâmetros para a consulta SQL.
     * @param {Function} callback O callback a ser chamado para cada linha.
     * @returns {Promise} Uma Promise que resolve com o número de linhas processadas.
     */
    each: async (query, params = [], callback) => {
        return new Promise((resolve, reject) => {
            db.each(query, params, callback, (err, count) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(count);
                }
            });
        });
    }
}