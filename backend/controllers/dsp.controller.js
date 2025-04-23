// controllers/dspLocationController.js
const DspLocation = require('../src/config/model/DspLocation.model.js');

const updateLocation = async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    // Retrieve userId from the authenticated user
    const userId = req.user.id;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Update or create the DSP location
    const updated = await DspLocation.findOneAndUpdate(
      { userId },
      { latitude, longitude, updatedAt: Date.now() },
      { upsert: true, new: true } // Create if not exists
    );
    
    res.status(200).json({ message: 'Location updated', location: updated });
  } catch (err) {
    console.error('Location update error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};



module.exports = {
  updateLocation,
};