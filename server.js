const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const port = 5500;
const MONGO_URI =
  "mongodb+srv://mo1234512345ed:123123321@thomas.xnsz58q.mongodb.net/?retryWrites=true&w=majority&appName=thomas";
// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));

// Define schema and model
const ReportSchema = new mongoose.Schema({
  address: String,
  cashOffer: String,
  offerAmountEPP: String,
  imageUpload: String,
  compImageUpload1: String,
  compImageUpload2: String,
  compImageUpload3: String,
});

const Report = mongoose.model("Report", ReportSchema);

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "images")); // Directory to save uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid name conflicts
  },
});
const upload = multer({ storage });
app.post(
  "/submit",
  upload.fields([
    { name: "imageUpload", maxCount: 1 },
    { name: "compImageUpload1", maxCount: 1 },
    { name: "compImageUpload2", maxCount: 1 },
    { name: "compImageUpload3", maxCount: 1 },
  ]),
  async (req, res) => {
    const { address, cashOffer, offerAmountEPP } = req.body;
    const files = req.files;
    console.log(req.body.address);
    console.log(req.body.cashOffer);
    console.log(req.body.offerAmountEPP);
    console.log(res.files);
    try {
      const newReport = new Report({
        address: address || "",
        cashOffer: cashOffer || "",
        offerAmountEPP: offerAmountEPP || "",
        imageUpload: files["imageUpload"]
          ? `/images/${files["imageUpload"][0].filename}`
          : "",
        compImageUpload1: files["compImageUpload1"]
          ? `/images/${files["compImageUpload1"][0].filename}`
          : "",
        compImageUpload2: files["compImageUpload2"]
          ? `/images/${files["compImageUpload2"][0].filename}`
          : "",
        compImageUpload3: files["compImageUpload3"]
          ? `/images/${files["compImageUpload3"][0].filename}`
          : "",
      });

      await newReport.save();
      res.json({ newReport, customerId: newReport._id });
    } catch (err) {
      console.error("Error saving report:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.get("/reports", async (req, res) => {
  const { customerId } = req.query;
  if (!customerId) {
    return res.status(400).json({ error: "Missing customerId parameter" });
  }
  try {
    const report = await Report.findById(customerId);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json(report);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: "Internal Server Error fetching" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
