import Joi from "joi";

// --- Create Schema ---

// Defines validation for creating a new chargeable service (ChargeableServiceCreate)
export const ChargeableServiceCreateSchema = Joi.object({
  branchId: Joi.number().integer().min(1).required()
    .messages({ "number.min": "Branch ID must be a positive integer." }),

  serviceName: Joi.string().trim().min(2).max(100).required()
    .messages({ "string.min": "Service name must be at least 2 characters long." }),
    
  // unitPrice should be a positive number (allowing decimals for currency)
  unitPrice: Joi.number().positive().required()
    .messages({ "number.positive": "Unit price must be a positive number." }),

  unitType: Joi.string().trim().min(1).max(50).required()
    .messages({ "string.min": "Unit type must be specified." }),
});

// --- Update Schema ---

//Defines validation for updating an existing chargeable service (ChargeableServiceUpdate)
// Note: serviceId must be passed in the input data structure for Joi validation, 
// even if it comes from the route parameters.
export const ChargeableServiceUpdateSchema = Joi.object({
  // Required ID for the record being updated
  serviceId: Joi.number().integer().min(1).required()
    .messages({ "number.min": "Service ID must be a positive integer." }),
  
  // All other fields are optional
  branchId: Joi.number().integer().min(1).optional()
    .messages({ "number.min": "Branch ID must be a positive integer." }),

  serviceName: Joi.string().trim().min(2).max(100).optional()
    .messages({ "string.min": "Service name must be at least 2 characters long." }),
    
  unitPrice: Joi.number().positive().optional()
    .messages({ "number.positive": "Unit price must be a positive number." }),
    
  unitType: Joi.string().trim().min(1).max(50).optional()
    .messages({ "string.min": "Unit type must be specified." }),
});
