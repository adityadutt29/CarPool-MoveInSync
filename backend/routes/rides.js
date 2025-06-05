const express = require('express');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const auth = require('../middleware/auth');
const RidePool = require('../models/RidePool');
const RideRequest = require('../models/RideRequest');
const User = require('../models/User');
const MatchService = require('../services/MatchService');
const EmailService = require('../services/EmailService');
const CacheService = require('../services/CacheService');

const router = express.Router();

/**
 * @route   POST /api/rides
 * @desc    Driver creates a ride pool
 * @access  Private
 */
router.post('/', auth, async (req, res, next) => {
  try {
    const {
      pickupLat, pickupLng,
      dropLat, dropLng,
      departureTime,
      totalSeats,
      vehicleInfo,
      rules
    } = req.body;

    if (
      pickupLat == null || pickupLng == null ||
      dropLat == null || dropLng == null ||
      !departureTime || !totalSeats
    ) {
      const err = new Error('pickup, drop, departureTime, totalSeats are required.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    const ride = new RidePool({
      driver: req.userId,
      pickupLat,
      pickupLng,
      dropLat,
      dropLng,
      departureTime: new Date(departureTime),
      totalSeats,
      availableSeats: totalSeats,
      vehicleInfo: vehicleInfo || { make: '', model: '', plateNo: '', color: '' },
      rules: rules || { femaleOnly: false, noSmoking: false, petAllowed: true }
    });

    await ride.save();
    res.status(201).json({ rideId: ride._id });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/rides/search
 * @desc    Rider searches for matching rides
 * @access  Private
 * Query params: origLat, origLng, destLat, destLng, time (ISO string)
 */
router.get('/search', auth, async (req, res, next) => {
  try {
    const { origLat, origLng, destLat, destLng, time } = req.query;
    if (!origLat || !origLng || !destLat || !destLng || !time) {
      const err = new Error('origLat, origLng, destLat, destLng, time required.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    // We cache search results under a composite key
    const roundedTime = new Date(time);
    roundedTime.setMinutes(Math.floor(roundedTime.getMinutes() / 15) * 15); // round to nearest 15m
    const cacheKey = `search:${origLat}:${origLng}:${destLat}:${destLng}:${roundedTime.toISOString()}`;
    const cached = CacheService.get(cacheKey);
    if (cached) {
      logger.info('Cache hit for key %s', cacheKey);
      return res.json(cached);
    }

    logger.info('Cache miss for key %s', cacheKey);

    const riderOrigin = { lat: parseFloat(origLat), lng: parseFloat(origLng) };
    const riderDest = { lat: parseFloat(destLat), lng: parseFloat(destLng) };
    const requestedTime = new Date(time);

    // Query: rides within 1 hour window & seats > 0
    const windowStart = new Date(requestedTime.getTime() - 60 * 60000);
    const windowEnd   = new Date(requestedTime.getTime() + 60 * 60000);

    logger.info(`Searching for rides between ${windowStart} and ${windowEnd}`);
    const candidates = await RidePool.find({
      departureTime: { $gte: windowStart, $lte: windowEnd },
      availableSeats: { $gt: 0 }
    }).populate('driver', 'displayName fullName showFullName email blurProfile gender smokingAllowed petAllowed');
    logger.info(`Found ${candidates.length} candidate rides`);

    // Filter by driver rules vs rider preferences
    const rider = await User.findById(req.userId);

    const filtered = candidates.filter((ride) => {
      if (ride.rules.femaleOnly && rider.gender !== 'female') return false;
      // If the ride does not allow pets and the rider has a pet, skip
      if (ride.rules.petAllowed === false && rider.petAllowed) return false;
      // If the ride does not allow smoking and the rider smokes, skip
      if (ride.rules.noSmoking && rider.smokingAllowed) return false;
      return true;
    });
    logger.info(`After rules filtering: ${filtered.length} rides`);

    // Compute match% for each
    const matches = filtered.map((ride) => {
      const driverOrig = { lat: ride.pickupLat, lng: ride.pickupLng };
      const driverDest = { lat: ride.dropLat, lng: ride.dropLng };
      const matchPercent = MatchService.computeMatchPercent(riderOrigin, riderDest, driverOrig, driverDest);
      const driverInfo = ride.driver;
      const displayName = driverInfo.showFullName ? driverInfo.fullName : driverInfo.displayName;

      return {
        rideId: ride._id,
        driver: { id: driverInfo._id, displayName, email: driverInfo.email },
        departureTime: ride.departureTime,
        totalSeats: ride.totalSeats,
        availableSeats: ride.availableSeats,
        vehicleInfo: ride.vehicleInfo,
        rules: ride.rules,
        matchPercent
      };
    });
    logger.info(`Computed matches for ${matches.length} rides`);

    // Sort descending by matchPercent
    matches.sort((a, b) => b.matchPercent - a.matchPercent);

    // Cache the result for 5 minutes
    CacheService.set(cacheKey, matches, 300);

    res.json(matches);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/rides/:rideId/requests
 * @desc    Rider sends a join request
 * @access  Private
 */
router.post('/:rideId/requests', auth, async (req, res, next) => {
  try {
    const { rideId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      const err = new Error('Invalid rideId.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    const ride = await RidePool.findById(rideId).populate('driver', 'email displayName');
    if (!ride) {
      const err = new Error('Ride not found.');
      err.statusCode = 404;
      err.code = 'RIDE_NOT_FOUND';
      throw err;
    }
    if (ride.availableSeats < 1) {
      const err = new Error('No seats available.');
      err.statusCode = 400;
      err.code = 'NO_SEATS';
      throw err;
    }

    // Check for existing PENDING or APPROVED request for same ride and rider
    const existing = await RideRequest.findOne({
      ride: rideId,
      rider: req.userId,
      status: { $in: ['PENDING', 'APPROVED'] }
    });
    if (existing) {
      const err = new Error('You already have a pending request.');
      err.statusCode = 400;
      err.code = 'DUPLICATE_REQUEST';
      throw err;
    }

    const request = new RideRequest({
      ride: rideId,
      rider: req.userId
    });
    await request.save();

    // Send email notification to driver
    const riderUser = await User.findById(req.userId);
    const riderName = riderUser.showFullName ? riderUser.fullName : riderUser.displayName;

    const subject = `🚗 New Ride Request from ${riderName}`;
    const text = `
      Hi ${ride.driver.displayName},

      ${riderName} has requested to join your ride:
      
      Ride ID: ${rideId}
      Departure: ${ride.departureTime.toLocaleString()}
      Pickup: (${ride.pickupLat}, ${ride.pickupLng})
      Destination: (${ride.dropLat}, ${ride.dropLng})

      Please log in to approve or reject:
      http://localhost:3000/driver/requests/${rideId}

      Thank you,
      MoveInSync Team
    `;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">New Ride Request</h2>
        <p>Hi ${ride.driver.displayName},</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>${riderName}</strong> has requested to join your ride:</p>
          <p><strong>Ride ID:</strong> ${rideId}</p>
          <p><strong>Departure:</strong> ${ride.departureTime.toLocaleString()}</p>
          <p><strong>Pickup:</strong> (${ride.pickupLat}, ${ride.pickupLng})</p>
          <p><strong>Destination:</strong> (${ride.dropLat}, ${ride.dropLng})</p>
        </div>
        
        <p>Please <a href="http://localhost:3000/driver/requests/${rideId}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Review Request</a></p>
        
        <p>Thank you,<br/><strong>MoveInSync Team</strong></p>
      </div>
    `;

    EmailService.send({
      to: ride.driver.email,
      subject,
      text,
      html
    }).catch(err => logger.warn('Email failure (new request): %s', err.message));

    res.status(201).json({ requestId: request._id, status: request.status });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/rides/:rideId/requests
 * @desc    Driver views pending requests
 * @access  Private
 */
router.get('/:rideId/requests', auth, async (req, res, next) => {
  try {
    const { rideId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      const err = new Error('Invalid rideId.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    const ride = await RidePool.findById(rideId);
    if (!ride) {
      const err = new Error('Ride not found.');
      err.statusCode = 404;
      err.code = 'RIDE_NOT_FOUND';
      throw err;
    }
    if (ride.driver.toString() !== req.userId) {
      const err = new Error('Forbidden: not the driver.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }
    const requests = await RideRequest.find({ ride: rideId })
      .populate('rider', 'displayName fullName showFullName email');
    const result = requests.map(rq => {
      const rider = rq.rider;
      const displayName = rider.showFullName ? rider.fullName : rider.displayName;
      return {
        requestId: rq._id,
        rider: { id: rider._id, displayName, email: rider.email },
        requestedAt: rq.requestedAt,
        status: rq.status  // include request status
      };
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/rides/:rideId/requests/:requestId/:action
 * @desc    Driver approves or rejects a request
 * @access  Private
 * Body: { action: "approve" | "reject" }
 */
router.post('/:rideId/requests/:requestId/:action', auth, async (req, res, next) => {
  try {
    const { rideId, requestId, action } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(rideId) ||
      !mongoose.Types.ObjectId.isValid(requestId)
    ) {
      const err = new Error('Invalid IDs.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    const ride = await RidePool.findById(rideId).populate('driver', 'displayName email');
    if (!ride) {
      const err = new Error('Ride not found.');
      err.statusCode = 404;
      err.code = 'RIDE_NOT_FOUND';
      throw err;
    }
    if (ride.driver._id.toString() !== req.userId) {
      const err = new Error('Forbidden: not the driver.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }
    const request = await RideRequest.findById(requestId).populate('rider', 'displayName fullName showFullName email');
    if (!request || request.ride.toString() !== rideId) {
      const err = new Error('Request not found for this ride.');
      err.statusCode = 404;
      err.code = 'REQUEST_NOT_FOUND';
      throw err;
    }
    if (request.status !== 'PENDING') {
      logger.info(`Request ${requestId} already processed with status: ${request.status}`);
      return res.status(400).json({
        error: 'Already processed',
        code: 'ALREADY_PROCESSED',
        currentStatus: request.status
      });
    }

    if (action === 'approve') {
      if (ride.availableSeats < 1) {
        const err = new Error('No seats left.');
        err.statusCode = 400;
        err.code = 'NO_SEATS';
        throw err;
      }
      ride.availableSeats -= 1;
      await ride.save();
      request.status = 'APPROVED';
    } else if (action === 'reject') {
      request.status = 'REJECTED';
      request.status = 'REJECTED';
    } else {
      const err = new Error('Invalid action. Use "approve" or "reject".');
      err.statusCode = 400;
      err.code = 'INVALID_ACTION';
      throw err;
    }

    await request.save();

    // Notify rider by email
    const rider = request.rider;
    const riderName = rider.showFullName ? rider.fullName : rider.displayName;

    let subject, text, html;

    if (action === 'approve') {
      subject = '✅ Ride Request Approved';
      text = `
        Hi ${riderName},

        Your request to join ride has been APPROVED:

        Ride ID: ${rideId}
        Departure: ${ride.departureTime.toLocaleString()}
        Driver: ${ride.driver.displayName}
        Contact: ${ride.driver.email}
        Vehicle: ${ride.vehicleInfo.make} ${ride.vehicleInfo.model} (${ride.vehicleInfo.color})
        License Plate: ${ride.vehicleInfo.plateNo}

        You can contact the driver for pickup details.

        Thank you,
        MoveInSync Team
      `;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Ride Request Approved</h2>
          <p>Hi ${riderName},</p>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p>Your request to join ride has been <strong>APPROVED</strong>:</p>
            <p><strong>Ride ID:</strong> ${rideId}</p>
            <p><strong>Departure:</strong> ${ride.departureTime.toLocaleString()}</p>
            <p><strong>Driver:</strong> ${ride.driver.displayName}</p>
            <p><strong>Contact:</strong> <a href="mailto:${ride.driver.email}">${ride.driver.email}</a></p>
            <p><strong>Vehicle:</strong> ${ride.vehicleInfo.color} ${ride.vehicleInfo.make} ${ride.vehicleInfo.model}</p>
            <p><strong>License Plate:</strong> ${ride.vehicleInfo.plateNo}</p>
          </div>
          
          <p>You can contact the driver for pickup details.</p>
          
          <p>Thank you,<br/><strong>MoveInSync Team</strong></p>
        </div>
      `;
    } else {
      subject = '❌ Ride Request Rejected';
      text = `
        Hi ${riderName},

        Your request to join ride has been REJECTED:

        Ride ID: ${rideId}
        Departure: ${ride.departureTime.toLocaleString()}

        Please search for other rides at:
        http://localhost:3000/search-rides

        Thank you,
        MoveInSync Team
      `;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Ride Request Rejected</h2>
          <p>Hi ${riderName},</p>
          
          <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p>Your request to join ride has been <strong>REJECTED</strong>:</p>
            <p><strong>Ride ID:</strong> ${rideId}</p>
            <p><strong>Departure:</strong> ${ride.departureTime.toLocaleString()}</p>
          </div>
          
          <p>Please <a href="http://localhost:3000/search-rides">search for other rides</a>.</p>
          
          <p>Thank you,<br/><strong>MoveInSync Team</strong></p>
        </div>
      `;
    }

    EmailService.send({
      to: rider.email,
      subject,
      text,
      html
    }).catch(err => logger.warn('Email failure (approve/reject): %s', err.message));

    res.json({ requestId, status: request.status });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PATCH /api/rides/:rideId/status
 * @desc    Update ride status (IN_PROGRESS or COMPLETED)
 * @access  Private (driver only)
 */
router.patch('/:rideId/status', auth, async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      const err = new Error('Invalid rideId.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    
    if (!['IN_PROGRESS', 'COMPLETED'].includes(status)) {
      const err = new Error('Invalid status. Use "IN_PROGRESS" or "COMPLETED".');
      err.statusCode = 400;
      err.code = 'INVALID_STATUS';
      throw err;
    }
    
    const ride = await RidePool.findById(rideId);
    if (!ride) {
      const err = new Error('Ride not found.');
      err.statusCode = 404;
      err.code = 'RIDE_NOT_FOUND';
      throw err;
    }
    
    if (ride.driver.toString() !== req.userId) {
      const err = new Error('Forbidden: not the driver.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }
    
    // Handle existing rides without status (default to UPCOMING)
    const currentStatus = ride.status || 'UPCOMING';
    
    // Validate status transitions
    if (status === 'IN_PROGRESS' && currentStatus !== 'UPCOMING') {
      const err = new Error('Ride must be UPCOMING to mark as IN_PROGRESS.');
      err.statusCode = 400;
      err.code = 'INVALID_TRANSITION';
      throw err;
    }
    
    if (status === 'COMPLETED' && currentStatus !== 'IN_PROGRESS') {
      const err = new Error('Ride must be IN_PROGRESS to mark as COMPLETED.');
      err.statusCode = 400;
      err.code = 'INVALID_TRANSITION';
      throw err;
    }
    
    ride.status = status;
    ride.updatedAt = new Date();
    await ride.save();
    
    // Return the full updated ride object
    const updatedRide = await RidePool.findById(rideId)
      .populate('driver', 'displayName fullName showFullName email');
    
    res.json({
      rideId: updatedRide._id,
      status: updatedRide.status,
      message: `Ride status updated to ${status}`,
      ride: updatedRide
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/rides/:rideId/details
 * @desc    Rider or driver fetches ride details (including masked info)
 * @access  Private
 */
router.get('/:rideId/details', auth, async (req, res, next) => {
  try {
    const { rideId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      const err = new Error('Invalid rideId.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    const ride = await RidePool.findById(rideId)
      .populate('driver', 'displayName fullName showFullName email blurProfile');
    if (!ride) {
      const err = new Error('Ride not found.');
      err.statusCode = 404;
      err.code = 'RIDE_NOT_FOUND';
      throw err;
    }

    let showContact = false;
    if (ride.driver._id.toString() === req.userId) {
      showContact = true;
    } else {
      const approvedRequest = await RideRequest.findOne({
        ride: rideId,
        rider: req.userId,
        status: 'APPROVED'
      });
      if (approvedRequest) showContact = true;
    }

    const driverInfo = {
      id: ride.driver._id,
      displayName: ride.driver.showFullName ? ride.driver.fullName : ride.driver.displayName,
      email: showContact ? ride.driver.email : '***-MASKED-***'
    };

    res.json({
      rideId: ride._id,
      driver: driverInfo,
      pickupLat: ride.pickupLat,
      pickupLng: ride.pickupLng,
      dropLat: ride.dropLat,
      dropLng: ride.dropLng,
      departureTime: ride.departureTime,
      totalSeats: ride.totalSeats,
      availableSeats: ride.availableSeats,
      vehicleInfo: ride.vehicleInfo,
      rules: ride.rules
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/rides/driver/:driverId/my-rides
 * @desc    Fetch all rides created by this driver
 * @access  Private (driver only)
 */
router.get('/driver/:driverId/my-rides', auth, async (req, res, next) => {
  try {
    const { driverId } = req.params;
    if (req.userId !== driverId) {
      const err = new Error('Forbidden.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }
    const rides = await RidePool.find({ driver: driverId }).lean();
    const formatted = rides.map((ride) => ({
      rideId: ride._id,
      departureTime: ride.departureTime,
      availableSeats: ride.availableSeats,
      totalSeats: ride.totalSeats
    }));
    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/rides/upcoming
 * @desc    Fetch upcoming rides for the current rider (approved requests)
 * @access  Private (rider)
 */
router.get('/upcoming', auth, async (req, res, next) => {
  try {
    // Find all approved ride requests for this rider
    const requests = await RideRequest.find({
      rider: req.userId,
      status: 'APPROVED'
    }).populate({
      path: 'ride',
      select: 'pickupLat pickupLng dropLat dropLng departureTime driver vehicleInfo rules',
      populate: {
        path: 'driver',
        select: 'displayName fullName showFullName'
      }
    });

    // Log the number of approved requests found
    logger.info(`Found ${requests.length} approved requests for rider ${req.userId}`);

    // For debugging: show all approved requests regardless of departure time
    const upcoming = requests;

    logger.info(`Found ${upcoming.length} upcoming rides after filtering by departure time`);

    // Format the response
    const formatted = upcoming.map(req => {
      const ride = req.ride;
      const driver = ride.driver;
      return {
        _id: req._id,
        rideId: ride._id,
        driver: {
          id: driver._id,
          displayName: driver.showFullName ? driver.fullName : driver.displayName
        },
        pickupLat: ride.pickupLat,
        pickupLng: ride.pickupLng,
        dropLat: ride.dropLat,
        dropLng: ride.dropLng,
        departureTime: ride.departureTime,
        vehicleInfo: ride.vehicleInfo,
        rules: ride.rules
      };
    });

    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/rides/:rideId/sos
 * @desc    Send an SOS/emergency email to driver (or approved rider)
 * @access  Private
 * Body: { message: string }
 */
router.post('/:rideId/sos', auth, async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const { message } = req.body;
    if (!message) {
      const err = new Error('Message is required.');
      err.statusCode = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    const ride = await RidePool.findById(rideId).populate('driver', 'email displayName');
    if (!ride) {
      const err = new Error('Ride not found.');
      err.statusCode = 404;
      err.code = 'RIDE_NOT_FOUND';
      throw err;
    }

    let allowed = false;
    if (ride.driver._id.toString() === req.userId) {
      allowed = true;
    } else {
      const approved = await RideRequest.findOne({
        ride: rideId,
        rider: req.userId,
        status: 'APPROVED'
      });
      if (approved) allowed = true;
    }
    if (!allowed) {
      const err = new Error('Forbidden: not part of this ride.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    // For simplicity, email the driver themself as "emergency contact"
    const subject = `SOS from Ride ${rideId}`;
    const text = `
      Hi ${ride.driver.displayName},

      Emergency alert from ride ${rideId}:
      "${message}"

      Please respond immediately.
    `;
    const html = `<p>Hi ${ride.driver.displayName},</p>
                  <p><strong>Emergency alert from ride ${rideId}:</strong></p>
                  <blockquote>${message}</blockquote>
                  <p>Please respond immediately.</p>`;

    await EmailService.send({
      to: ride.driver.email,
      subject,
      text,
      html
    });

    res.json({ message: 'SOS email sent to driver.' });
  } catch (err) {
    next(err);
  }
});

/**
    * @route   POST /api/rides/:rideId/sos
    * @desc    Send an SOS message to the company
    * @access  Private
    */
   router.post('/:rideId/sos', auth, async (req, res, next) => {
     try {
       const { rideId } = req.params;
       const { message } = req.body;

       if (!mongoose.Types.ObjectId.isValid(rideId)) {
         const err = new Error('Invalid rideId.');
         err.statusCode = 400;
         err.code = 'VALIDATION_ERROR';
         throw err;
       }

       const ride = await RidePool.findById(rideId).populate('driver', 'displayName email');
       if (!ride) {
         const err = new Error('Ride not found.');
         err.statusCode = 404;
         err.code = 'RIDE_NOT_FOUND';
         throw err;
       }

       const user = await User.findById(req.userId);
       const userName = user.showFullName ? user.fullName : user.displayName;

       const subject = `🚨 SOS Alert from ${userName} (Ride: ${rideId})`;
       const text = `
         SOS Message: ${message}

         Ride Details:
           Ride ID: ${rideId}
           Driver: ${ride.driver.displayName} (${ride.driver.email})
           Departure: ${ride.departureTime}
           Route: (${ride.pickupLat}, ${ride.pickupLng}) to (${ride.dropLat}, ${ride.dropLng})

         Sent by:
           Name: ${userName}
           Email: ${user.email}
       `;

       // Send to company email
       await EmailService.send({
         to: 'emeloc9@gmail.com', // TODO: Make this configurable via environment variable
         subject,
         text
       }).catch(err => logger.warn('EmailService.send failed for SOS: %s', err.message));

       res.json({ message: 'SOS sent to the company.' });
     } catch (err) {
       next(err);
     }
   });

module.exports = router;