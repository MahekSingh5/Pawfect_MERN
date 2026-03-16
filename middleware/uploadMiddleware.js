const multer = require("multer");
const path = require("path");
// Store uploaded file temporarily on disk
const storage = multer.diskStorage({});

// Allow only image files
const fileFilter = (req, file, cb) => {
    console.log("Uploaded file info:", file);

    const allowedTypes = /jpg|jpeg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith("image/") || file.mimetype === "application/octet-stream";

    if(extname && mimetype){ //Every uploaded file has a MIME type (jpg->image/jpeg, png → image/png, pdf → application/pdf)
        cb(null, true);
    }else{
        cb(new Error("Only JPG, JPEG, PNG, and WEBP image files are allowed"), false);
    }
};
//Create multer upload instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 //5mb
    }
});

module.exports = upload;