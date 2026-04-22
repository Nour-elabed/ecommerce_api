import Joi from "joi";
import { ROLES } from "../../../constants/roles.js";

export const adminCreateOrUpdateProductSchema = Joi.object({
    title: Joi.string().min(2).max(150).required(),
    description: Joi.string().min(10).max(3000).required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).required(),
    image: Joi.string().allow("").required(),
    category: Joi.string().valid("Electronics", "Clothing", "Accessories", "Home", "Sports", "Beauty").required(),
});

export const adminUpdateUserRoleSchema = Joi.object({
    role: Joi.string()
        .valid(ROLES.USER, ROLES.ADMIN)
        .required(),
});

export const adminUpdateOrderStatusSchema = Joi.object({
    status: Joi.string().valid("pending", "shipped", "delivered", "canceled").required(),
});
