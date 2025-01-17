import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jwt from 'jsonwebtoken';
import multer from 'multer';

/**
 * Directorio raiz de la aplicación.
 */
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
/**
 * Directorio de vistas.
 */
const viewsDir = path.join(rootDir, 'views');
/**
 * Directorio público.
 */
const publicDir = path.join(rootDir, 'public');
/**
 * Directorio de uploads.
 */
const uploadDir = path.join(publicDir, 'uploads');
/**
 * Tamaño máximo de una solicitud.
 */
const maxRequestSize = 64 * 1024 * 1024;
/**
 * Tamaño máximo de un fichero subido.
 */
const maxUploadFileSize = 4 * 1024 * 1024;

/**
 * Nombre de la cookie que contiene el JWT.
 */
const jwtCookieName = 'jwt';

/**
 * Tiempo hasta la expiración del JWT.
 */
const jwtExpiresIn = 5 * 24 * 60 * 60 * 1000;

// Inicializa el directorio de uploads controlado por multer
const upload = multer({ dest: uploadDir });

/**
 * Inyexta en las cookies de respuesta el JWT.
 * @param {object} res 
 * @param {string} jwt
 * @param {boolean} secure
 */
const setJwtCookie = (res, jwt, secure) => {
    res.cookie(jwtCookieName, jwt, {
        maxAge: jwtExpiresIn,
        httpOnly: true,
        secure
    });
};

/**
 * Genera un JWT con datos pasados en un objeto.
 * @param {object} data
 * @returns {Promise<string>}
 */
const generateJwt = async data => {
    return new Promise(
        (resolve, reject) =>
            jwt.sign({ data }, process.env.JWT_SECRET,
                // La expiración aquí debe ir en segundos
                { expiresIn: jwtExpiresIn / 1000 },
                (err, token) => err ? reject(err) : resolve(token)
            )
    );
};

/**
 * Middleware para interceptar una petición y comprobar que
 * exista autorización de acceso. Si el token JWT es válido
 * se renueva la autorización. Si no es válido o no existe
 * se redirecciona a la página de login.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const requireAuthorization = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.redirect('/auth/login');
    }

    try {
        // Extraemos el usuario codificado en el JWT          
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET,
                (err, payload) => err ? reject(err) : resolve(payload));
        });
        // Agremamos el usuario a la solicitud y renovamos el JWT
        req.user = decoded.data;
        const newToken = await generateJwt(req.user);
        setJwtCookie(res, newToken, req.secure);
        // Cedemos el control al siguiente middleware
        return next();
    } catch (error) {
        return res.redirect('/auth/login');
    }
};

/**
 * Middleware para interceptar una petición y obtener el usuario autenticado.
 * Si no hay usuario se devuelve undefined.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const getAuthenticatedUser = async (req, res, next) => {
    const token = req.cookies.jwt;
    req.user = undefined;

    try {
        if (token) {
            // Extraemos el usuario codificado en el JWT          
            const decoded = await new Promise((resolve, reject) => {
                jwt.verify(token, process.env.JWT_SECRET,
                    (err, payload) => err ? reject(err) : resolve(payload));
            });
            // Agremamos el usuario a la solicitud y renovamos el JWT
            req.user = decoded.data;
            const newToken = await generateJwt(req.user);
            setJwtCookie(res, newToken, req.secure);
        }
    } catch (error) {
        ; // Se ignora el error         
    } finally {
        // Cedemos el control al siguiente middleware
        return next();
    }
};

/**
 * Middleware para interceptar una petición y comprobar que
 * no exista autorización de acceso. Si no existe autorización
 * se pasa al siguiente middleware, pero en caso de que la haya
 * se envía al cliente a la página de inicio.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const requireNoAuthorization = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return next();
    }

    try {
        // Extraemos el usuario codificado en el JWT          
        await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET,
                (err, payload) => err ? reject(err) : resolve(payload));
        });
        // Como hay autorización se le envía a inicio
        return res.redirect('/');
    } catch (error) {
        // Al siguiente middleware
        return next();
    }
};

export {
    rootDir,
    viewsDir,
    publicDir,
    uploadDir,
    upload,
    maxRequestSize,
    maxUploadFileSize,
    jwtCookieName,
    jwtExpiresIn,
    setJwtCookie,
    generateJwt,
    requireAuthorization,
    getAuthenticatedUser,
    requireNoAuthorization
};
