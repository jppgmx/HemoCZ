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

// Define a tabela de agendamento
const appointmentSchema = `
    CREATE TABLE IF NOT EXISTS appointment (
        id CHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        blood_type VARCHAR(3) NOT NULL,
        appointment_date TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'Aguardando',
        CONSTRAINT PK_Appointment PRIMARY KEY (id),
        CONSTRAINT CHK_BloodType CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
        CONSTRAINT CHK_Status CHECK (status IN ('Aguardando', 'Coletado', 'Cancelado')),
        CONSTRAINT CHK_AppointmentDate CHECK (appointment_date >= CURRENT_TIMESTAMP)
    );
`;

// Define a tabela mensagem
const messageSchema = `
    CREATE TABLE IF NOT EXISTS message (
        id CHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        subject VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT PK_Message PRIMARY KEY (id)
    );
`;

// Define a tabela campanha
const campaignSchema = `
    CREATE TABLE IF NOT EXISTS campaign (
        id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(10) NOT NULL,
        CONSTRAINT PK_Campaign PRIMARY KEY (id)
    );
`;

// Define a tabela anuncio
const announcementSchema = `
    CREATE TABLE IF NOT EXISTS announcement (
        id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        text TEXT NOT NULL,
        image BLOB NOT NULL,
        CONSTRAINT PK_Announcement PRIMARY KEY (id)
    );
`;

// Define a tabela evento
const eventSchema = `
    CREATE TABLE IF NOT EXISTS event (
        id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        datetime TIMESTAMP NOT NULL,
        street VARCHAR(100) NOT NULL,
        number VARCHAR(10),
        city VARCHAR(50) NOT NULL,
        state VARCHAR(50) NOT NULL,
        CONSTRAINT PK_Event PRIMARY KEY (id),
        CONSTRAINT CHK_Datetime CHECK (datetime >= CURRENT_TIMESTAMP),
        CONSTRAINT CHK_State CHECK (state IN ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO')),
        CONSTRAINT CHK_Number CHECK (number > 0 OR number IS NULL)
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
        user: userSchema,
        appointment: appointmentSchema,
        message: messageSchema,
        campaign: campaignSchema,
        announcement: announcementSchema,
        event: eventSchema
    },
    /**
     * Inserções padrão para popular o banco de dados
     * @type {Object.<string, string>}
     */
    defaultInserts: {
        adminUserInsert: adminUserInsert
    }
};