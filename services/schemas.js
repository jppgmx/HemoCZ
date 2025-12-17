/**
 * Schemas SQL e inserções padrão para o banco de dados
 * @module services/schemas
 */

// Define SQL schema para 'user'
const userSchema = `
    CREATE TABLE IF NOT EXISTS user (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        passwd VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

const adminUserInsert = `
    INSERT INTO user (username, name, email, passwd) VALUES
    ('admin', 'Administrator', 'admin@example.com', '$argon2id$v=19$m=64,t=8,p=8$bzJiWm9ZWk12Y0R5Y2tXWA$Eby7mcYDFR5d2xygj/VouqmFRQFAdYqNKbrSEPd0PAODY5K3wuOaSG9lnKbPnoUlaOUSbGdgvuG+QhyY8zTK1g');
`;

module.exports = {
    /**
     * Schemas das tabelas do banco de dados
     * @type {Object.<string, string>}
     */
    schemas: {
        user: userSchema
    },
    /**
     * Inserções padrão para popular o banco de dados
     * @type {Object.<string, string>}
     */
    defaultInserts: {
        adminUserInsert: adminUserInsert
    }
};