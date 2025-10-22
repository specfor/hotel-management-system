import Joi from "joi";

// --- Create Schema ---

// Defines validation for creating a new service usage record (ServiceUsageCreate)
export const ServiceUsageCreateSchema = Joi.object({
  // Required fields for a new service usage record
  serviceId: Joi.number().integer().min(1).required()
    .messages({ "number.min": "Service ID must be a positive integer." }),
    
  bookingId: Joi.number().integer().min(1).required()
    .messages({ "number.min": "Booking ID must be a positive integer." }),
    
  // Quantity must be a positive number (allowing decimals, e.g., for time/weight)
  quantity: Joi.number().positive().required()
    .messages({ "number.positive": "Quantity must be a positive number." }),
});

// --- Update Schema ---

// Defines validation for updating an existing service usage record (ServiceUsageUpdate)
// Note: recordId must be included in the object passed for validation.
export const ServiceUsageUpdateSchema = Joi.object({
  // Required ID for the record being updated
  recordId: Joi.number().integer().min(1).required()
    .messages({ "number.min": "Record ID must be a positive integer." }),
  
  // All other fields are optional for a partial update
  serviceId: Joi.number().integer().min(1).optional()
    .messages({ "number.min": "Service ID must be a positive integer." }),
    
  bookingId: Joi.number().integer().min(1).optional()
    .messages({ "number.min": "Booking ID must be a positive integer." }),
    
  quantity: Joi.number().positive().optional()
    .messages({ "number.positive": "Quantity must be a positive number." }),
    
  // dateTime is typically set by the database or handled in the model/repo, 
  // but if it's allowed in an update, it should be validated as a valid ISO date string.
  dateTime: Joi.date().iso().optional(),
});
