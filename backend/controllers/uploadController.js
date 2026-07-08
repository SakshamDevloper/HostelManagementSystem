exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    res.json({ success: true, data: { url: `/uploads/photos/${req.file.filename}`, filename: req.file.filename } });
  } catch (error) {
    next(error);
  }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    res.json({ success: true, data: { url: `/uploads/documents/${req.file.filename}`, filename: req.file.filename } });
  } catch (error) {
    next(error);
  }
};
