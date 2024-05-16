import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
            cb(new Error('Only JPG, JPEG, and PNG files are allowed'));
        } else {
            cb(null, true);
        }
    }
}).single('avatar');

export default upload;
