/**
 * @module routes/appointments
 * Rotas para o gerenciamento de agendamentos.
 */

const express = require('express');
const authRequired = require('../middlewares/auth');
const db = require('../services/database');

// region CRUD Agendamentos

async function createAppointment(req, res) {
    const {
        name, bloodType, phone, email, dateTime, id, status
    } = req.body;

    try {
        const emailExists = db.get('SELECT COUNT(*) AS count FROM appointment WHERE email = ?', [email]);
        if (emailExists.count > 0) {
            return res.status(400).json({ message: 'Um agendamento com este e-mail já existe.' });
        }

        const result = db.run(
            `INSERT INTO appointment (id, name, email, phone, blood_type, appointment_date, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, name, email, phone, bloodType, dateTime, status]
        );
        res.status(201).json({ message: 'Agendamento criado com sucesso.' });
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ message: 'Erro ao criar agendamento.' });
    }
}

async function countAppointmentsForDatetime(req, res) {
    const { dateTime } = req.query;
    const datetime = new Date(dateTime);

    try{
        const result = db.get(
            'SELECT COUNT(*) AS count FROM appointment WHERE appointment_date = ?',
            [datetime.toISOString()]
        );
        res.status(200).json({ count: result.count });
    } catch (error) {
        console.error('Erro ao contar agendamentos para a data e hora:', error);
        res.status(500).json({ message: 'Erro ao contar agendamentos para a data e hora.' });
    }
}

async function getAppointments(req, res) {
    try {
        const appointments = db.all('SELECT * FROM appointment');
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Erro ao obter agendamentos:', error);
        res.status(500).json({ message: 'Erro ao obter agendamentos.' });
    }
}

async function updateAppointmentStatus(req, res) {
    const { id, status } = req.body;
    try {
        const result = db.run(
            'UPDATE appointment SET status = ? WHERE id = ?',
            [status, id]
        );
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado.' });
        }
        res.status(200).json({ message: 'Status do agendamento atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar status do agendamento:', error);
        res.status(500).json({ message: 'Erro ao atualizar status do agendamento.' });
    }
}

async function deleteAppointment(req, res) {
    const { id } = req.params;
    try {
        const result = db.run(
            'DELETE FROM appointment WHERE id = ?',
            [id]
        );
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Agendamento não encontrado.' });
        }
        res.status(200).json({ message: 'Agendamento deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar agendamento:', error);
        res.status(500).json({ message: 'Erro ao deletar agendamento.' });
    }
}

// endregion

const router = express.Router();

router.post('/create', createAppointment);
router.get('/count', countAppointmentsForDatetime);
router.put('/update-status', authRequired, updateAppointmentStatus);
router.delete('/delete/:id', authRequired, deleteAppointment);
router.get('/', authRequired, getAppointments);
module.exports = router;