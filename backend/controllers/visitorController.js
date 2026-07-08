const VisitorLog = require('../models/VisitorLog');
const { generatePassNo } = require('../utils/helpers');

exports.getVisitors = async (req, res, next) => {
  try {
    const { date, search } = req.query;
    const query = {};
    if (date) {
      const d = new Date(date);
      query.inTime = { $gte: d, $lt: new Date(d.getTime() + 24 * 60 * 60 * 1000) };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
        { passNo: { $regex: search, $options: 'i' } },
      ];
    }
    const visitors = await VisitorLog.find(query)
      .populate({ path: 'visitingStudent', populate: { path: 'user', select: 'name' } })
      .populate('recordedBy', 'name')
      .sort({ inTime: -1 });
    res.json({ success: true, data: visitors });
  } catch (error) {
    next(error);
  }
};

exports.createVisitor = async (req, res, next) => {
  try {
    const visitor = await VisitorLog.create({
      ...req.body,
      passNo: generatePassNo(),
      recordedBy: req.user._id,
    });
    const populated = await VisitorLog.findById(visitor._id)
      .populate({ path: 'visitingStudent', populate: { path: 'user', select: 'name' } });
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.checkoutVisitor = async (req, res, next) => {
  try {
    const visitor = await VisitorLog.findByIdAndUpdate(req.params.id, { outTime: new Date() }, { new: true });
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found' });
    res.json({ success: true, data: visitor });
  } catch (error) {
    next(error);
  }
};
