const MessMenu = require('../models/MessMenu');
const logActivity = require('../utils/logger');
const { getIO } = require('../config/socket');

exports.getMenu = async (req, res, next) => {
  try {
    const { mess, date } = req.query;
    const query = {};
    if (mess) query.mess = mess;
    if (date) query.date = new Date(date);
    const menu = await MessMenu.find(query).sort({ date: 1, meal: 1 });
    res.json({ success: true, data: menu });
  } catch (error) {
    next(error);
  }
};

exports.getWeekMenu = async (req, res, next) => {
  try {
    const { mess, startDate } = req.query;
    if (!startDate) return res.status(400).json({ success: false, message: 'startDate is required' });
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const query = { date: { $gte: start, $lte: end } };
    if (mess) query.mess = mess;
    const menu = await MessMenu.find(query).sort({ date: 1, meal: 1 });
    res.json({ success: true, data: menu });
  } catch (error) {
    next(error);
  }
};

exports.createMenu = async (req, res, next) => {
  try {
    const { mess, date, meal, items, notes } = req.body;
    const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const data = await MessMenu.findOneAndUpdate(
      { mess, date: new Date(date), meal },
      { mess, date: new Date(date), day, meal, items, notes },
      { upsert: true, returnDocument: 'after' }
    );
    await logActivity({ user: req.user._id, action: 'create', resource: 'messMenu', resourceId: data._id, details: { mess, date, meal }, ip: req.ip });
    const io = getIO();
    if (io) io.emit('mess-menu-updated', { mess, date });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.bulkCreateMenu = async (req, res, next) => {
  try {
    const entries = req.body.entries;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ success: false, message: 'entries array is required' });
    }
    const ops = entries.map(e => ({
      updateOne: {
        filter: { mess: e.mess, date: new Date(e.date), meal: e.meal },
        update: { $set: { mess: e.mess, date: new Date(e.date), day: new Date(e.date).toLocaleDateString('en-US', { weekday: 'long' }), meal: e.meal, items: e.items, notes: e.notes || '' } },
        upsert: true,
      },
    }));
    const result = await MessMenu.bulkWrite(ops);
    await logActivity({ user: req.user._id, action: 'bulkCreate', resource: 'messMenu', details: { count: entries.length }, ip: req.ip });
    const io = getIO();
    if (io) io.emit('mess-menu-updated', { bulk: true });
    res.status(201).json({ success: true, data: { matched: result.matchedCount, upserted: result.upsertedCount, modified: result.modifiedCount } });
  } catch (error) {
    next(error);
  }
};

exports.updateMenu = async (req, res, next) => {
  try {
    const { items, notes } = req.body;
    const menu = await MessMenu.findByIdAndUpdate(req.params.id, { items, notes }, { returnDocument: 'after' });
    if (!menu) return res.status(404).json({ success: false, message: 'Menu entry not found' });
    await logActivity({ user: req.user._id, action: 'update', resource: 'messMenu', resourceId: menu._id, details: { mess: menu.mess, date: menu.date, meal: menu.meal }, ip: req.ip });
    const io = getIO();
    if (io) io.emit('mess-menu-updated', { mess: menu.mess, date: menu.date });
    res.json({ success: true, data: menu });
  } catch (error) {
    next(error);
  }
};

exports.deleteMenu = async (req, res, next) => {
  try {
    const menu = await MessMenu.findByIdAndDelete(req.params.id);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu entry not found' });
    await logActivity({ user: req.user._id, action: 'delete', resource: 'messMenu', resourceId: menu._id, details: { mess: menu.mess, date: menu.date, meal: menu.meal }, ip: req.ip });
    const io = getIO();
    if (io) io.emit('mess-menu-updated', { mess: menu.mess, date: menu.date });
    res.json({ success: true, message: 'Menu entry deleted' });
  } catch (error) {
    next(error);
  }
};
