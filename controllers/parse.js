const parser = require("exceljs");
const fs = require("fs");
const shell = require("shelljs");
const loki = require("lokijs");
// database initialization and configuration
const db = new loki("parsed.db", {
  autoload: true,
  autoloadCallback: databaseInitilization,
  autosave: true,
  autosaveInterval: 4000,
});

function databaseInitilization() {
  const headers = db.getCollection("headers");
  const rows = db.getCollection("rows");
  if (headers === null) {
    db.addCollection("headers");
  }
  if (rows === null) {
    db.addCollection("rows");
  }
}
module.exports = {
  truncateUploadDirectory: (req, res, next) => {
    shell.exec("rm -rf  uploads/*", function (code, stdout, stderr) {
      console.log("Exit code:", code);
      console.log("Program output:", stdout);
      console.log("Program stderr:", stderr);
    });
    next();
  },
  createHeaders: async (req, res, next) => {
    const workBook = new parser.Workbook();
    const headers = db.getCollection("headers");
    headers.clear();
    console.log(req.files[0]);
    await workBook.xlsx.readFile(req.files[0].path).then((book) => {
      book
        .getWorksheet()
        .getRow(1)
        .eachCell((cell) => {
          headers.insert({
            value: cell.value,
          });
        });
    });
    next();
  },
  createRows: (req, res, next) => {
    const rows = db.getCollection("rows");

    rows.clear();
    req.files.forEach(async (file, fileIndex) => {
      const readStream = fs.createReadStream(file.path);
      const workBook = new parser.Workbook();
      await workBook.xlsx.read(readStream).then((book) => {
        book
          .getWorksheet()
          .getSheetValues()
          .forEach((eachRow, rowIndex) => {
            if (rowIndex === 0) {
              return;
            } else {
              let singleRow = {
                row: [],
              };
              singleRow.row = eachRow.map((item) => {
                if (item.formula === undefined) {
                  return item;
                } else {
                  if (typeof item === "object") {
                    let formula = item.formula;
                    formula = formula.replace("HYPERLINK", "");
                    formula = formula.replace("(", "");
                    formula = formula.replace(")", "");
                    formula = formula.replace('"', "");
                    formula = formula.replace('"', "");
                    formula = formula.split(",");
                    formula = formula[0];
                    item.formula = formula;
                    return item;
                  }
                }
              });

              rows.insert(singleRow);
            }
          });
      });
    });
    next();
  },
  sendStatus: (req, res, next) => {
    res.status(200).json({ message: "Parsed Successfully" });
  },
  sendRows: (req, res, next) => {
    res.send([{ headers }, { dataRow }]);
  },
};
