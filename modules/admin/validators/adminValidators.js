import Joi from "joi";

export const adminCreateOrUpdateProductSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    brand: Joi.string().min(1).max(100).required(),
    description: Joi.string().min(10).max(3000).required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).required(),
    image: Joi.string().allow("").required(),
    category: Joi.string().valid("Luxury", "Sport", "Classic", "Smart", "Minimalist").required(),
    gender: Joi.string().valid("MEN", "WOMEN", "UNISEX").required(),
    style: Joi.string().allow("").optional(),
    tags: Joi.array().items(Joi.string()).optional(),
});

export const adminUpdateOrderStatusSchema = Joi.object({
    status: Joi.string().valid("pending", "shipped", "delivered", "canceled").required(),
});

