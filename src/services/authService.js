// src/services/authService.js
import BaseDatos from '../baseDatos.js';
import { EmailService } from './emailService.js';
import { EmailNotificationService } from './emailNotificationService.js';


const db = new BaseDatos();

export class AuthService {
    
    /**
     * "Encripta" una contraseña (en producción usar bcrypt)
     * @param {string} password - Contraseña a encriptar
     * @returns {string} - Contraseña "encriptada"
     */
    static encriptarPassword(password) {
        // ⚠️ EN PRODUCCIÓN USAR bcrypt - esto es solo para demo
        return btoa(unescape(encodeURIComponent(password))); // Base64 simple
    }

    /**
     * Verifica una contraseña
     * @param {string} password - Contraseña a verificar
     * @param {string} hash - Hash almacenado
     * @returns {boolean} - true si coinciden
     */
    static verificarPassword(password, hash) {
        // ⚠️ EN PRODUCCIÓN USAR bcrypt.compare
        const passwordEncriptado = btoa(unescape(encodeURIComponent(password)));
        return passwordEncriptado === hash;
    }

    /**
     * Registra un nuevo usuario con contraseña encriptada
     * @param {Object} usuarioData - Datos del usuario
     * @returns {Object} - Resultado del registro
     */
    static async registrarUsuario(usuarioData) {
        try {
            // Verificar que el email no exista
            const verificacion = await EmailService.verificarEmail(usuarioData.email);
            if (verificacion.exists) {
                return {
                    success: false,
                    message: 'El email ya está registrado'
                };
            }

            // Validar contraseña
            if (!usuarioData.password || usuarioData.password.length < 6) {
                return {
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                };
            }

            // Encriptar contraseña
            const passwordEncriptada = this.encriptarPassword(usuarioData.password);

            // Crear nuevo usuario
            const nuevoUsuario = {
                id: 'user_' + Date.now(),
                email: usuarioData.email.toLowerCase().trim(),
                password: passwordEncriptada,
                nombre: usuarioData.nombre,
                rol: 'cliente',
                isVerified: false,
                createdAt: new Date().toISOString()
            };

            db.agregarUsuario(nuevoUsuario);
            /*
            return {
                success: true,
                message: 'Usuario registrado exitosamente',
                user: { ...nuevoUsuario, password: undefined } // No devolver password
            };

        } catch (error) {
            console.error('Error registrando usuario:', error);
            return {
                success: false,
                message: 'Error al registrar usuario'
            };
        }
        }
            */

                //      ✅ ENVIAR EMAIL DE CONFIRMACIÓN
            EmailNotificationService.enviarEmailConfirmacion(nuevoUsuario.email, nuevoUsuario.nombre)
                .then(resultado => {
                    if (resultado.success) {
                        console.log('📧 Email de confirmación enviado exitosamente');
                    } else {
                        console.warn('⚠️ Email de confirmación no pudo enviarse:', resultado.message);
                    }
                })
                .catch(error => {
                    console.error('❌ Error enviando email de confirmación:', error);
                });

            return {
                success: true,
                message: 'Usuario registrado exitosamente. Se ha enviado un email de confirmación.',
                user: { ...nuevoUsuario, password: undefined }
            };

        } catch (error) {
            console.error('Error registrando usuario:', error);
            return {
                success: false,
                message: 'Error al registrar usuario'
            };
        }
    }


    /**
     * Inicia sesión de usuario
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña
     * @returns {Object} - Resultado del login
     */
    /*
    static async loginUsuario(email, password) {
        try {
            const usuario = db.findUserByEmail(email);
            
            if (!usuario) {
                return {
                    success: false,
                    message: 'Email no registrado'
                };
            }

            // Verificar contraseña
            const passwordValida = this.verificarPassword(password, usuario.password);
            if (!passwordValida) {
                return {
                    success: false,
                    message: 'Contraseña incorrecta'
                };
            }

            return {
                success: true,
                message: 'Login exitoso',
                user: { ...usuario, password: undefined } // No devolver password
            };

        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                message: 'Error en el servidor'
            };
        }
    }
        
*/
    /**
 * Inicia sesión de usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Object} - Resultado del login
 */

static async loginUsuario(email, password) {
    try {
        console.log('🔐 LOGIN UNIVERSAL:', { email, password });
        
        const usuario = db.findUserByEmail(email);
        
        if (!usuario) {
            return { success: false, message: 'Email no registrado' };
        }

        // ✅ ACEPTAR SIEMPRE para testing
        console.log('✅ LOGIN EXITOSO (modo testing)');
        return {
            success: true,
            message: 'Login exitoso',
            user: { 
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                puntos: usuario.puntos || 0
            }
        };

    } catch (error) {
        console.error('❌ Error en login:', error);
        return { success: false, message: 'Error en el servidor' };
    }
}

}