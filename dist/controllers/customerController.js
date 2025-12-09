"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCustomers = void 0;
const db_1 = __importDefault(require("../config/db"));
const getAllCustomers = async (req, res) => {
    try {
        const result = await db_1.default.query(`SELECT 
        id, 
        name, 
        email, 
        created_at 
       FROM customers 
       ORDER BY created_at DESC`);
        res.json({
            success: true,
            data: result.rows.map(customer => ({
                id: customer.id,
                name: customer.name,
                email: customer.email,
                createdAt: customer.created_at
            }))
        });
    }
    catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch customers'
        });
    }
};
exports.getAllCustomers = getAllCustomers;
//# sourceMappingURL=customerController.js.map