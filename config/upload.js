const multer = require('multer');
const fs = require('fs');

const upload = multer({
    storage: multer.diskStorage({

        destination: (req, file, cb) => {
            // console.log(req); return

            // dynamic directories
            // 1. directories of admin uploads
            // 2. directories of student uploads
            // 3. directories of student uploads

            // decide sub-folders based on url info
            // use the role of user with url info

            const route = req.originalUrl;
            // return console.log(route);

            let dir = "./uploads/";
            if (req.user.role === 'admin' && route.includes('profile-picture')) {
                dir = "./uploads/admin/profile-pictures/";
            } else if (req.user.role === 'instructor' && route.includes('profile-picture')) {
                dir = "./uploads/instructor/profile-pictures/";
            } else if (req.user.role === 'student' && route.includes('profile-picture')) {
                dir = "./uploads/student/profile-pictures/";
            }
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