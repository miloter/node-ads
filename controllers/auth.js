import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcrypt';
import {
    jwtCookieName,
    generateJwt,
    setJwtCookie,
    uploadDir,
    maxUploadFileSize
} from "../helpers/utils.js";
import { db } from '../helpers/db.js';
import TextValidator from '@miloter/text-validator';

// Datos de la página de registro
const registerPage = {
    title: 'Registrarse',
    description: 'Permite registrarse con un email, username y password',
    keywords: 'email, username, password'
};
// Datos de la página de login
const loginPage = {
    title: 'Iniciar Sesión',
    description: 'Formulario de inicio de sesión',
    keywords: 'login'
};

// Despliega la vista de registro en la aplicación
const authSignUpGet = (req, res, next) => {
    res.render(req.path.substring(1), {
        page: registerPage
    });    
};

// Permite el registro en la aplicación, si el registro es
// correcto, se devuelve una cookie con un JSON Web Token
const authSignUpPost = async (req, res, next) => {
    try {        
        const file = req.file;
        const {email, username, password} = req.body;        
        const urlPath = req.path.substring(1);
        const tv = new TextValidator();
        
        if (file) {
            tv.validateFileSize(file.size, maxUploadFileSize);
            tv.validateFilename(file.originalname, { reExt: TextValidator.reImgExt });
        }

        tv.validateMail(email);
        tv.validateUsername(username);
        tv.validatePassword(password);

        if (tv.isError()) {
            return res.render(urlPath, {
                page: registerPage,
                errors: tv.getMsgs(),
                email, username, password
            });        
        }

        // Comprueba que no exista el usuario o el email
        let [result] = await db.execute(
            'select * from users where username = ? or email = ?',
            [username, email]);
        if (result.length) {
            tv.addError('Utilice otro nombre de usuario, o e-mail');
            return res.render(urlPath, {
                page: registerPage,
                errors: tv.getMsgs(),
                email, username, password
            });            
        }

        // Obtenemos el hash del password
        const passwordHash = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

        [result] = await db.execute(
            'insert into users(username, password, email, avatar) values(?, ?, ?, ?)',
            [username, passwordHash, email, file ? file.originalname : null]);
        
        if (file) {
            // Guardamos el fichero en disco
            await fs.rename(file.path, path.join(uploadDir, file.originalname));
        }
        
        // Genera la cookie de sesión y la envía al cliente
        const accessToken = await generateJwt({
            id: result.insertId,
            username,
            is_admin: 0,
            avatar: file ? file.originalname : undefined
        });  
        setJwtCookie(res, accessToken, req.secure);                
        // Lo mandamos a la página de inicio
        return res.redirect('/');        
    } catch (error) {
        return next(error);
    }
};

// Despliega la vista del inicio de sesión en la aplicación
const authLoginGet = (req, res) => {
    res.render(req.path.substring(1), {
        page: loginPage
    });    
};

// Permite el inicio de sesión en la aplicación, si el inicio es
// correcto, se devuelve un JSON Web Token
const authLoginPost = async (req, res, next) => {
    try {
        const msgUnathorized = 'Usuario o contraseña incorrectos';
        const { username, password } = req.body;
        const urlPath = req.path.substring(1);
        const tv = new TextValidator();
        const [user] = await db.execute('select * from users where username = ?', [username]);

        if (user.length) {
            const match = await bcrypt.compare(password, user[0].password);

            if (match) {
                const { id, username, is_admin, avatar } = user[0];
                const accessToken = await generateJwt({
                    id,
                    username,
                    is_admin,
                    avatar
                });  
                setJwtCookie(res, accessToken, req.secure);                
                return res.redirect('/');
            } else {
                tv.addError(msgUnathorized);
                return res.render(urlPath, {
                    page: loginPage,
                    errors: tv.getMsgs(),
                    username, password
                });        
            }
        } else {
            tv.addError(msgUnathorized);            
            return res.render(urlPath, {
                page: loginPage,
                errors: tv.getMsgs(),
                username, password
            });        
        }
    } catch (error) {
        next(error);
    }
};

// Cierra la sesión
const authLogoutGet = (req, res, next) => {
    res.cookie(jwtCookieName, '', { maxAge: -1 });      
    res.redirect('/auth/login');
};

export {    
    authSignUpGet, authSignUpPost,
    authLoginGet, authLoginPost,
    authLogoutGet
};
