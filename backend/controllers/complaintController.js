const Complaint = require('../src/config/model/complaint');
const User = require('../src/config/model/Users.model');
const Merchant = require("../src/config/model/Merchant.model.js");
const DSP = require("../src/config/model/DSP.model.js");


// Create a Complaint
exports.createComplaint = async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    await complaint.save();
    res.status(201).send(complaint);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};



// Get All Complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find();
 const userID = complaints.userId;
    res.send(complaints);
  } catch (error) {
    res.status(500).send(error);
  }
}
// Get a Single Complaint
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).send({ error: 'Complaint not found' });
    }

    // Fetch customer, merchant, and DSP details in parallel
    const [customer, merchant, dsp] = await Promise.all([
      User.findById(complaint.CustomerId),
      Merchant.findById(complaint.merchantId),
      DSP.findById(complaint.dspId)
    ]);

    // Fetch additional merchant and DSP details if necessary
    let merchantUser = null;
    if (merchant) {
      merchantUser = await User.findById(merchant.userId);
    }

    let dspUser = null;
    if (dsp) {
      dspUser = await User.findById(dsp.userId); // Assuming DSP has a userId field similar to merchant
    }

    // Format the response
    const response = {
      complaint: {
        orderId: complaint.OrderId,
        description: complaint.description,
        status: complaint.status
      },
      customer: customer ? customer.toObject() : null,
      merchant: merchantUser ? {
        ...merchantUser.toObject(),
        merchantDetails: merchant ? merchant.toObject() : null
      } : null,
      dsp: dspUser ? {
        ...dspUser.toObject(),
        dspDetails: dsp ? dsp.toObject() : null
      } : null
    };

    res.send(response);
  } catch (error) {
    res.status(500).send({ error: error.message });
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
