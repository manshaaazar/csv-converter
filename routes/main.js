const app = require("express"),
  router = app.Router(),
  parseController = require("../controllers/parse"),
  multer = require("multer");

// initializing the multer storage
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads");
  },
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${file.originalname}}`);
  },
});
const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "text/csv" ||
    file.mimetype ===
      `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  ) {
    callback(null, true);
  } else {
    callback(
      new Error(`wrong file formate, only CSV/XLSX are allowed.`),
      false
    );
  }
};
const uploadMulter = multer({ storage, fileFilter });

router
  .route("/parse")
  .post(
    parseController.truncateUploadDirectory,
    uploadMulter.array("csv|xlsx-files"),
    parseController.createHeaders,
    parseController.createRows,
    parseController.sendStatus
  );
router.route("/data").get(parseController.sendRows);
module.exports = router;
