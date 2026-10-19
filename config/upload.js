const multer = require('multer');
const fs = require('fs');

const upload = multer({
    storage: multer.diskStorage({

        destination: (req, file, cb) => {
            const dir = "./uploads/";
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir)
        },

        filename: (req, file, cb) => {
            let filePath = Number(new Date()).toString(32) + Math.random().toString(32).substring(2);
            let fileName = filePath + "." + file.mimetype.split("/").pop();
            cb(null, fileName)
        }
    }),
});

module.exports = upload;