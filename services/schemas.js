
// Define SQL schema para 'Usuario'
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
    ('admin', 'Administrator', 'admin@example.com', '$argon2id$v=19$m=64,t=16,p=8$UHp6WlZmdU5YejM2amh0Sg$tSLhWO88WC5tdqakJH3yX8oOwBpuQSRpJLZeIyL8hbZ2UccUNpwsYlbJDvT8eFq3nKcmY+Dz4vXRs3AgrsY23Q');
`;

module.exports = {
    schemas: {
        user: userSchema
    },
    defaultInserts: {
        adminUserInsert: adminUserInsert
    }
};