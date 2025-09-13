/**
 * Índice de funcionalidades de media
 * Facilita las importaciones desde la carpeta media
 */

// Imágenes
export {
    subirImagenStorage,
    eliminarImagenStorage,
    actualizarImagenStorage,
    generateImagePath,
    esUrlProSocial,
    obtenerInfoImagen
} from './images.actions';

// Tipos
export type {
    ImageUploadResult,
    ImageDeleteResult,
    VideoUploadResult,
    VideoDeleteResult,
    MediaCategory,
    RepositoryInfo,
    MediaFile
} from './types';

// Videos (futuro)
// export { subirVideoStorage, eliminarVideoStorage } from './videos.actions';

// Repositorios (futuro)  
// export { crearRepositorio, eliminarRepositorio } from './repositories.actions';
