/**
 * @module routes/assistance
 * Rotas para o gerenciamento de anúncios, campanhas e eventos.
 */

const express = require('express');
const authRequired = require('../middlewares/auth');
const db = require('../services/database');

const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB por arquivo
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem JPEG e PNG são permitidos.'));
        }
    }
})

// region CRUD Anúncios (Slides)

/**
 * HTTP POST /api/assistance/announcements
 * Cria um novo anúncio/slide para o carrossel (requer autenticação).
 * @param {import("express").Request} req - Objeto de requisição do Express contendo id, title, text, mime e image no body.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP; não retorna valor.
 */
async function createAnnouncement(req, res) {
    const createData = {
        id: parseInt(req.body.id, 10),
        title: req.body.title,
        text: req.body.text,
    };

    const mime = req.file?.mimetype;
    const image = req.file?.buffer;

    try {
        const exists = db.get('SELECT COUNT(*) AS count FROM announcement WHERE id = ?', [createData.id]);
        if (exists.count > 0) {
            return res.status(400).json({ message: 'Um anúncio com este ID já existe.' });
        }

        db.run(
            `INSERT INTO announcement (id, title, text, mime, image)
             VALUES (?, ?, ?, ?, ?)`,
            [createData.id, createData.title, createData.text, mime, image]
        );
        res.status(201).json({ message: 'Anúncio criado com sucesso.' });
    } catch (error) {
        console.error('Erro ao criar anúncio:', error);
        res.status(500).json({ message: 'Erro ao criar anúncio.' });
    }
}

/**
 * HTTP GET /api/assistance/announcements
 * Obtém todos os anúncios cadastrados (sem imagens, apenas metadados).
 * @param {import("express").Request} req - Objeto de requisição do Express.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP com a lista de anúncios; não retorna valor.
 */
async function getAnnouncements(req, res) {
    try {
        const announcements = db.all('SELECT id, title, text, mime FROM announcement');
        res.status(200).json(announcements);
    } catch (error) {
        console.error('Erro ao obter anúncios:', error);
        res.status(500).json({ message: 'Erro ao obter anúncios.' });
    }
}

/**
 * HTTP GET /api/assistance/announcements/:id/image
 * Obtém a imagem binária de um anúncio específico.
 * @param {import("express").Request} req - Objeto de requisição do Express contendo id nos parâmetros da URL.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia a imagem com o Content-Type apropriado; não retorna valor.
 */
async function getAnnouncementImage(req, res) {
    const { id } = req.params;
    try {
        const announcement = db.get('SELECT mime, image FROM announcement WHERE id = ?', [id]);
        if (!announcement) {
            return res.status(404).json({ message: 'Anúncio não encontrado.' });
        }
        res.setHeader('Content-Type', announcement.mime);
        res.send(announcement.image);
    } catch (error) {
        console.error('Erro ao obter imagem do anúncio:', error);
        res.status(500).json({ message: 'Erro ao obter imagem do anúncio.' });
    }
}

/**
 * HTTP PUT /api/assistance/announcements/:id
 * Atualiza um anúncio existente (requer autenticação).
 * @param {import("express").Request} req - Objeto de requisição do Express contendo id nos parâmetros e title, text, mime, image no body.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP; não retorna valor.
 */
async function updateAnnouncement(req, res) {
    const updateData = {
        id: parseInt(req.params.id, 10),
        title: req.body.title,
        text: req.body.text,
    };

    const mime = req.file?.mimetype;
    const image = req.file?.buffer;

    try {
        let query, params;
        if (image) {
            query = 'UPDATE announcement SET title = ?, text = ?, mime = ?, image = ? WHERE id = ?';
            params = [updateData.title, updateData.text, mime, image, updateData.id];
        } else {
            query = 'UPDATE announcement SET title = ?, text = ? WHERE id = ?';
            params = [updateData.title, updateData.text, updateData.id];
        }

        const result = db.run(query, params);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Anúncio não encontrado.' });
        }
        res.status(200).json({ message: 'Anúncio atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar anúncio:', error);
        res.status(500).json({ message: 'Erro ao atualizar anúncio.' });
    }
}

/**
 * HTTP DELETE /api/assistance/announcements/:id
 * Remove um anúncio pelo ID (requer autenticação).
 * @param {import("express").Request} req - Objeto de requisição do Express contendo id nos parâmetros da URL.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP; não retorna valor.
 */
async function deleteAnnouncement(req, res) {
    const { id } = req.params;
    try {
        const result = db.run('DELETE FROM announcement WHERE id = ?', [id]);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Anúncio não encontrado.' });
        }
        res.status(200).json({ message: 'Anúncio deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar anúncio:', error);
        res.status(500).json({ message: 'Erro ao deletar anúncio.' });
    }
}

// endregion

// region CRUD Campanhas

/**
 * HTTP POST /api/assistance/campaigns
 * Cria uma nova campanha de doação (requer autenticação).
 * @param {import("express").Request} req - Objeto de requisição do Express contendo id, title, description e icon no body.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP; não retorna valor.
 */
async function createCampaign(req, res) {
    const { id, title, description, icon } = req.body;

    try {
        const exists = db.get('SELECT COUNT(*) AS count FROM campaign WHERE id = ?', [id]);
        if (exists.count > 0) {
            return res.status(400).json({ message: 'Uma campanha com este ID já existe.' });
        }

        db.run(
            `INSERT INTO campaign (id, title, description, icon)
             VALUES (?, ?, ?, ?)`,
            [id, title, description, icon]
        );
        res.status(201).json({ message: 'Campanha criada com sucesso.' });
    } catch (error) {
        console.error('Erro ao criar campanha:', error);
        res.status(500).json({ message: 'Erro ao criar campanha.' });
    }
}

/**
 * HTTP GET /api/assistance/campaigns
 * Obtém todas as campanhas cadastradas.
 * @param {import("express").Request} req - Objeto de requisição do Express.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP com a lista de campanhas; não retorna valor.
 */
async function getCampaigns(req, res) {
    try {
        const campaigns = db.all('SELECT * FROM campaign');
        res.status(200).json(campaigns);
    } catch (error) {
        console.error('Erro ao obter campanhas:', error);
        res.status(500).json({ message: 'Erro ao obter campanhas.' });
    }
}

/**
 * HTTP PUT /api/assistance/campaigns/:id
 * Atualiza uma campanha existente (requer autenticação).
 * @param {import("express").Request} req - Objeto de requisição do Express contendo id nos parâmetros e title, description, icon no body.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP; não retorna valor.
 */
async function updateCampaign(req, res) {
    const { id } = req.params;
    const { title, description, icon } = req.body;

    try {
        const result = db.run(
            'UPDATE campaign SET title = ?, description = ?, icon = ? WHERE id = ?',
            [title, description, icon, id]
        );
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }
        res.status(200).json({ message: 'Campanha atualizada com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar campanha:', error);
        res.status(500).json({ message: 'Erro ao atualizar campanha.' });
    }
}

/**
 * HTTP DELETE /api/assistance/campaigns/:id
 * Remove uma campanha pelo ID (requer autenticação).
 * @param {import("express").Request} req - Objeto de requisição do Express contendo id nos parâmetros da URL.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP; não retorna valor.
 */
async function deleteCampaign(req, res) {
    const { id } = req.params;
    try {
        const result = db.run('DELETE FROM campaign WHERE id = ?', [id]);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Campanha não encontrada.' });
        }
        res.status(200).json({ message: 'Campanha deletada com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar campanha:', error);
        res.status(500).json({ message: 'Erro ao deletar campanha.' });
    }
}

// endregion

// region CRUD Eventos

/**
 * HTTP POST /api/assistance/events
 * Cria um novo evento de doação (requer autenticação).
 * @param {import("express").Request} req - Objeto de requisição do Express contendo id, title, description, datetime, street, number, neighborhood, city e state no body.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP; não retorna valor.
 */
async function createEvent(req, res) {
    const { id, title, description, datetime, street, number, neighborhood, city, state } = req.body;

    try {
        const exists = db.get('SELECT COUNT(*) AS count FROM event WHERE id = ?', [id]);
        if (exists.count > 0) {
            return res.status(400).json({ message: 'Um evento com este ID já existe.' });
        }

        db.run(
            `INSERT INTO event (id, title, description, datetime, street, number, neighborhood, city, state)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, title, description, datetime, street, number || null, neighborhood, city, state]
        );
        res.status(201).json({ message: 'Evento criado com sucesso.' });
    } catch (error) {
        console.error('Erro ao criar evento:', error);
        res.status(500).json({ message: 'Erro ao criar evento.' });
    }
}

/**
 * HTTP GET /api/assistance/events
 * Obtém todos os eventos cadastrados.
 * @param {import("express").Request} req - Objeto de requisição do Express.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP com a lista de eventos; não retorna valor.
 */
async function getEvents(req, res) {
    try {
        const events = db.all('SELECT * FROM event');
        res.status(200).json(events);
    } catch (error) {
        console.error('Erro ao obter eventos:', error);
        res.status(500).json({ message: 'Erro ao obter eventos.' });
    }
}

/**
 * HTTP PUT /api/assistance/events/:id
 * Atualiza um evento existente (requer autenticação).
 * @param {import("express").Request} req - Objeto de requisição do Express contendo id nos parâmetros e title, description, datetime, street, number, neighborhood, city, state no body.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP; não retorna valor.
 */
async function updateEvent(req, res) {
    const { id } = req.params;
    const { title, description, datetime, street, number, neighborhood, city, state } = req.body;

    try {
        const result = db.run(
            `UPDATE event SET title = ?, description = ?, datetime = ?, street = ?, 
             number = ?, neighborhood = ?, city = ?, state = ? WHERE id = ?`,
            [title, description, datetime, street, number || null, neighborhood, city, state, id]
        );
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Evento não encontrado.' });
        }
        res.status(200).json({ message: 'Evento atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        res.status(500).json({ message: 'Erro ao atualizar evento.' });
    }
}

/**
 * HTTP DELETE /api/assistance/events/:id
 * Remove um evento pelo ID (requer autenticação).
 * @param {import("express").Request} req - Objeto de requisição do Express contendo id nos parâmetros da URL.
 * @param {import("express").Response} res - Objeto de resposta do Express.
 * @returns {Promise<void>} Envia uma resposta HTTP; não retorna valor.
 */
async function deleteEvent(req, res) {
    const { id } = req.params;
    try {
        const result = db.run('DELETE FROM event WHERE id = ?', [id]);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Evento não encontrado.' });
        }
        res.status(200).json({ message: 'Evento deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar evento:', error);
        res.status(500).json({ message: 'Erro ao deletar evento.' });
    }
}

// endregion

const router = express.Router();

// Rotas de Anúncios (públicas para GET, protegidas para modificações)
router.get('/announcements', getAnnouncements);
router.get('/announcements/:id/image', getAnnouncementImage);
router.post('/announcements', authRequired, upload.single('image'), createAnnouncement);
router.put('/announcements/:id', authRequired, upload.single('image'), updateAnnouncement);
router.delete('/announcements/:id', authRequired, deleteAnnouncement);

// Rotas de Campanhas (públicas para GET, protegidas para modificações)
router.get('/campaigns', getCampaigns);
router.post('/campaigns', authRequired, createCampaign);
router.put('/campaigns/:id', authRequired, updateCampaign);
router.delete('/campaigns/:id', authRequired, deleteCampaign);

// Rotas de Eventos (públicas para GET, protegidas para modificações)
router.get('/events', getEvents);
router.post('/events', authRequired, createEvent);
router.put('/events/:id', authRequired, updateEvent);
router.delete('/events/:id', authRequired, deleteEvent);

module.exports = router;