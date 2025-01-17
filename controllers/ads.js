import { db } from "../helpers/db.js";
import TextValidator from "@miloter/text-validator";

const adsGet = (req, res, next) => {    
    res.render('ads/ads', {
        page: {
            title: 'Tu lista de NodeAds',
            description: 'Tu Página para ver Anuncios',
            keywords: 'sitio, web, anuncios'
        },
        user: req.user
    });
};

// Devuelve un JSON con los anuncios: GET /api/ads
const apiAdsGet = async (req, res, next) => {
    const statusOk = 200, statusError = 500;    

    try {        
        const [rows] = await db.execute(`select a.id, user_id, username,
            avatar, text, contact, last_modified
            from ads a inner join users u on a.user_id = u.id;
        `);        
        
        return res.status(statusOk).json({            
            status: statusOk,
            success: 'Registros obtenidos',
            user: req.user,
            rows
        });           
    } catch (error) {
        return res.status(statusError).json({            
            status: statusError,            
            error: error.stack
        });           
    }
};

// Procesa una petición para eliminar un anuncio: DELETE /api/ads/:id
const apiAdsIdDelete = async (req, res, next) => {
    const statusOk = 200, statusBadRequest = 400;

    try {
        const id = req.params.id;

        // Elimina el anuncio
        const [result] = await db.execute(
            'delete from ads where id = ?', [id]);
        if (result.affectedRows === 1) {
            return res.status(statusOk).json({
                status: statusOk,
                success: 'Anuncio eliminado con éxito'
            });
        } else {
            return res.status(statusBadRequest).json({
                status: statusBadRequest,
                error: `Identificador de anuncio inválido: ${id}`
            });
        }
    } catch (error) {
        return res.status(statusBadRequest).json({
            status: statusBadRequest,
            error: error.stack
        });
    }
};

// Procesa una petición para actualizar un anuncio: PUT /api/ads
const apiAdsIdPut = async (req, res, next) => {
    const statusOk = 200, statusBadRequest = 400;

    try {
        const { id, text, contact } = req.body;
        const tv = new TextValidator();

        if (!(
            tv.validate(text, TextValidator.reAnyWordChar,
                'El texto debe contener al menos un carácter alfanumérico',
                { maxLength: 255 }) &&
            tv.validate(contact, TextValidator.reStr,
                'Los datos de contacto no son válidos',
                { maxLength: 64 })
            )) {
            return res.status(statusBadRequest).json({
                status: statusBadRequest,
                error: tv.getLastMessage()
            });
        }
        
        // Actualizamos el anuncio
        const [result] = await db.execute(
            'update ads set text = ?, contact = ? where id = ?', [text, contact, id]);
        if (result.changedRows === 1) {
            return res.status(statusOk).json({
                status: statusOk,
                success: 'Anuncio actualizado con éxito',
            });
        } else if (result.affectedRows === 1) {
            return res.status(statusBadRequest).json({
                status: statusBadRequest,
                error: 'El anuncio no ha cambiado',
            });
        } else {
            return res.status(statusBadRequest).json({
                status: statusBadRequest,
                error: `Identificador de anuncio inválido: ${id}`
            });
        }
    } catch (error) {
        return res.status(statusBadRequest).json({
            status: statusBadRequest,
            error: error.stack
        });
    }
};

export {
    adsGet,
    apiAdsGet,
    apiAdsIdDelete,
    apiAdsIdPut
};
