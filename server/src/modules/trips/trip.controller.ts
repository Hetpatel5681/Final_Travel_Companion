import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { tripService } from './trip.service';
import { Trip } from './trip.model';
import { createTripSchema, updateTripSchema, updateTripCoordinatesSchema } from './trip.schema';
import { aiService } from '../ai/ai.service';
import { itineraryService } from '../itinerary/itinerary.service';

export const generateAITrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    if (!aiService.isConfigured()) {
      res.status(503).json({ success: false, message: 'GEMINI_API_KEY is required for live AI generation.' });
      return;
    }

    const { destination, startDate, endDate, budget, travelers, travelPreferences, interests } = req.body;
    if (!destination || !startDate || !endDate) {
      res.status(400).json({ success: false, message: 'Missing required configuration (destination, startDate, endDate)' });
      return;
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const expectedDays = Math.ceil((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // 1. Generate via AI Service
    const aiResponse = await aiService.generateItinerary({
      destination, startDate, endDate, expectedDays, budget, travelers, travelPreferences, interests
    });

    if (!aiResponse || !aiResponse.days) {
      res.status(500).json({ success: false, message: 'AI failed to generate a valid structured itinerary' });
      return;
    }

    // 2. Persist Trip (Phase 4)
    const tripData: any = {
      title: `Trip to ${destination}`,
      destination: { name: destination, country: 'Unknown' }, // simplified for mapping
      startDate: sDate,
      endDate: eDate,
      budget: req.body.budget || 2000,
      currency: 'INR',
      tripType: travelers > 1 ? 'Family' : 'Solo',
      interests: Array.isArray(interests) ? interests : [interests].filter(Boolean),
      numberOfTravelers: Number(travelers) || 1,
      aiStatus: 'Completed',
      aiSummary: aiResponse.summary || 'Generated via AI'
    };

    const trip = await tripService.createTrip(req.user._id.toString(), tripData);

    // 3. Persist Itinerary Days & Activities
    for (const [index, dayObj] of aiResponse.days.entries()) {
      const dayRecord = await itineraryService.createItineraryDay(req.user._id.toString(), trip._id.toString(), {
        dayNumber: index + 1,
        title: dayObj.theme || `Day ${index + 1}`,
        date: new Date(sDate.getTime() + index * (1000 * 60 * 60 * 24))
      });

      if (dayObj.activities && Array.isArray(dayObj.activities)) {
        for (const [aIndex, act] of dayObj.activities.entries()) {
          let safeCategory = 'Custom';
          const validCategories = ['Sightseeing', 'Restaurant', 'Hotel', 'Shopping', 'Adventure', 'Transport', 'Flight', 'Train', 'Bus', 'Cafe', 'Temple', 'Museum', 'Beach', 'Custom'];
          
          if (act.category) {
            const rawCat = act.category.toString().trim();
            if (validCategories.includes(rawCat)) {
               safeCategory = rawCat;
            } else if (rawCat.toLowerCase() === 'transit') {
               safeCategory = 'Transport';
            } else if (rawCat.toLowerCase() === 'food' || rawCat.toLowerCase() === 'dining') {
               safeCategory = 'Restaurant';
            } else if (rawCat.toLowerCase() === 'accommodation') {
               safeCategory = 'Hotel';
            } else if (rawCat.toLowerCase() === 'attraction' || rawCat.toLowerCase() === 'activity') {
               safeCategory = 'Sightseeing';
            }
          }

          await itineraryService.createActivity(req.user._id.toString(), dayRecord._id.toString(), {
            title: act.title || 'Activity',
            description: act.description || '',
            category: safeCategory,
            orderIndex: aIndex,
            startTime: act.startTime || '09:00',
            endTime: act.endTime || '10:00',
            location: {
              address: act.locationName || act.title || destination
            }
          });
        }
      }
    }

    res.status(201).json({ success: true, data: trip, message: 'Trip generated and saved successfully' });
  } catch (error: any) {
    console.error('AI Trip Gen Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

export const generateAITripForExisting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    if (!aiService.isConfigured()) {
      res.status(503).json({ success: false, message: 'GEMINI_API_KEY is required for live AI generation.' });
      return;
    }

    const { preferences, budget, interests } = req.body;
    const tripId = req.params.id;

    // Retrieve existing trip
    const trip: any = await tripService.getTripById(tripId, req.user._id.toString());
    if (!trip) {
      res.status(404).json({ success: false, message: 'Trip not found' });
      return;
    }

    const sDate = new Date(trip.startDate);
    const eDate = new Date(trip.endDate);
    const expectedDays = trip.totalDays || (Math.ceil((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // 1. Generate via AI Service using existing Trip Data
    const aiResponse = await aiService.generateItinerary({
      destination: trip.destination.name,
      startDate: sDate.toISOString().split('T')[0],
      endDate: eDate.toISOString().split('T')[0],
      expectedDays,
      budget: budget || trip.budget,
      travelers: trip.numberOfTravelers,
      travelPreferences: preferences || trip.preferences,
      interests: Array.isArray(interests) ? interests : trip.interests,
      travelStyle: trip.travelStyle
    });

    if (!aiResponse || !aiResponse.days) {
      res.status(500).json({ success: false, message: 'AI failed to generate a valid structured itinerary' });
      return;
    }

    // 2. Clear old itinerary days and activities strictly using the new method
    await itineraryService.clearItineraryForTrip(req.user._id.toString(), tripId);

    // 3. Update the existing Trip specifically with the AI result
    // Cannot use updateTrip because it explicitly strips aiStatus. Using direct update.
    await Trip.updateOne(
      { _id: tripId, createdBy: req.user._id },
      { $set: { aiStatus: 'Completed', aiSummary: aiResponse.summary || 'Generated via AI' } }
    );

    // Provide the mutated trip back via the service to ensure full output
    const updatedTrip = await tripService.getTripById(tripId, req.user._id.toString());

    // 4. Persist Itinerary Days & Activities exactly into the new clean slate
    for (const [index, dayObj] of aiResponse.days.entries()) {
      const dayRecord = await itineraryService.createItineraryDay(req.user._id.toString(), tripId, {
        dayNumber: index + 1,
        title: dayObj.theme || `Day ${index + 1}`,
        date: new Date(sDate.getTime() + index * (1000 * 60 * 60 * 24))
      });

      if (dayObj.activities && Array.isArray(dayObj.activities)) {
        for (const [aIndex, act] of dayObj.activities.entries()) {
          let safeCategory = 'Custom';
          const validCategories = ['Sightseeing', 'Restaurant', 'Hotel', 'Shopping', 'Adventure', 'Transport', 'Flight', 'Train', 'Bus', 'Cafe', 'Temple', 'Museum', 'Beach', 'Custom'];
          
          if (act.category) {
            const rawCat = act.category.toString().trim();
            if (validCategories.includes(rawCat)) {
               safeCategory = rawCat;
            } else if (rawCat.toLowerCase() === 'transit') {
               safeCategory = 'Transport';
            } else if (rawCat.toLowerCase() === 'food' || rawCat.toLowerCase() === 'dining') {
               safeCategory = 'Restaurant';
            } else if (rawCat.toLowerCase() === 'accommodation') {
               safeCategory = 'Hotel';
            } else if (rawCat.toLowerCase() === 'attraction' || rawCat.toLowerCase() === 'activity') {
               safeCategory = 'Sightseeing';
            }
          }

          await itineraryService.createActivity(req.user._id.toString(), dayRecord._id.toString(), {
            title: act.title || 'Activity',
            description: act.description || '',
            category: safeCategory,
            orderIndex: aIndex,
            startTime: act.startTime || '09:00',
            endTime: act.endTime || '10:00',
            location: {
              address: act.locationName || act.title || trip.destination.name
            }
          });
        }
      }
    }

    res.status(200).json({ success: true, data: updatedTrip, message: 'AI Itinerary generated successfully' });
  } catch (error: any) {
    console.error('Existing AI Trip Gen Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

export const createTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const validatedData = createTripSchema.parse(req);
    const tripData: Parameters<typeof tripService.createTrip>[1] = {
      ...validatedData.body,
      startDate: validatedData.body.startDate ? new Date(validatedData.body.startDate) : undefined,
      endDate: validatedData.body.endDate ? new Date(validatedData.body.endDate) : undefined,
    };
    const trip = await tripService.createTrip(req.user._id.toString(), tripData);
    res.status(201).json({ success: true, message: 'Trip created successfully', data: trip });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Validation Error' });
  }
};

export const getTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    
    const filters = {
      tripStatus: req.query.tripStatus as string,
      country: req.query.country as string,
      tripType: req.query.tripType as string,
    };
    
    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sort: req.query.sort as string || 'createdAt'
    };

    const data = await tripService.getTripsByUser(req.user._id.toString(), filters, options);
    res.status(200).json({ success: true, message: 'Trips retrieved successfully', data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getTripById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const trip = await tripService.getTripById(req.params.id, req.user._id.toString());
    res.status(200).json({ success: true, message: 'Trip retrieved successfully', data: trip });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const updateTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const validatedData = updateTripSchema.parse(req);
    const tripData: Parameters<typeof tripService.updateTrip>[2] = {
      ...validatedData.body,
      startDate: validatedData.body.startDate ? new Date(validatedData.body.startDate) : undefined,
      endDate: validatedData.body.endDate ? new Date(validatedData.body.endDate) : undefined,
    };
    const trip = await tripService.updateTrip(req.params.id, req.user._id.toString(), tripData);
    res.status(200).json({ success: true, message: 'Trip updated successfully', data: trip });
  } catch (error: any) {
    res.status(error.status || 400).json({ success: false, message: error.message || 'Error updating trip' });
  }
};

export const deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    await tripService.deleteTrip(req.params.id, req.user._id.toString());
    res.status(200).json({ success: true, message: 'Trip deleted successfully', data: {} });
  } catch (error: any) {
    res.status(error.status || 400).json({ success: false, message: error.message || 'Error deleting trip' });
  }
};

export const updateTripCoordinates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const validatedData = updateTripCoordinatesSchema.parse(req);
    const trip = await tripService.updateCoordinates(
      req.params.id, 
      req.user._id.toString(), 
      validatedData.body.latitude, 
      validatedData.body.longitude
    );
    res.status(200).json({ success: true, message: 'Trip coordinates updated successfully', data: trip });
  } catch (error: any) {
    res.status(error.status || 400).json({ success: false, message: error.message || 'Error updating trip coordinates' });
  }
};
