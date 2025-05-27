const Complaint = require('../src/config/model/complaint');

// Create a Complaint
exports.createComplaint = async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.status(201).send(complaint);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Get All Complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.send(complaints);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Get a Single Complaint
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).send();
    }
    res.send(complaint);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Update a Complaint
exports.updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!complaint) {
      return res.status(404).send();
    }
    res.send(complaint);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Delete a Complaint
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).send();
    }
    res.send(complaint);
  } catch (error) {
    res.status(500).send(error);
  }
};
