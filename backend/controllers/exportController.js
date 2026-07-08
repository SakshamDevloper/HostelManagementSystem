const ExcelJS = require('exceljs');
const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');

exports.exportStudents = async (req, res, next) => {
  try {
    const { format = 'xlsx' } = req.query;
    const students = await Student.find().populate('user', 'name email phone').populate('room', 'roomNumber');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Students');
    sheet.columns = [
      { header: 'Student ID', key: 'studentId', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Room', key: 'room', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Check In', key: 'checkIn', width: 15 },
    ];
    students.forEach(s => {
      sheet.addRow({
        studentId: s.studentId,
        name: s.user?.name || '',
        email: s.user?.email || '',
        phone: s.user?.phone || '',
        room: s.room?.roomNumber || '-',
        status: s.status,
        checkIn: s.checkInDate ? s.checkInDate.toISOString().split('T')[0] : '',
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

exports.exportPayments = async (req, res, next) => {
  try {
    const { from, to, format = 'xlsx' } = req.query;
    const query = {};
    if (from || to) {
      query.paidAt = {};
      if (from) query.paidAt.$gte = new Date(from);
      if (to) query.paidAt.$lte = new Date(to);
    }
    const payments = await Payment.find(query).populate({ path: 'student', populate: { path: 'user', select: 'name' } });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Payments');
    sheet.columns = [
      { header: 'Receipt No', key: 'receiptNo', width: 20 },
      { header: 'Student', key: 'student', width: 25 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Date', key: 'date', width: 15 },
    ];
    payments.forEach(p => {
      sheet.addRow({
        receiptNo: p.receiptNo,
        student: p.student?.user?.name || '',
        amount: p.totalAmount,
        type: p.type,
        status: p.status,
        date: p.paidAt?.toISOString().split('T')[0] || '',
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=payments.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

exports.exportComplaints = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const complaints = await Complaint.find(query).populate({ path: 'student', populate: { path: 'user', select: 'name' } });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Complaints');
    sheet.columns = [
      { header: 'Student', key: 'student', width: 25 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Date', key: 'date', width: 15 },
    ];
    complaints.forEach(c => {
      sheet.addRow({
        student: c.student?.user?.name || '',
        category: c.category,
        status: c.status,
        date: c.createdAt?.toISOString().split('T')[0] || '',
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=complaints.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
