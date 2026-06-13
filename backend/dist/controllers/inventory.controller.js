"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getForecast = exports.getLowStockAlerts = exports.deleteItem = exports.updateItem = exports.createItem = exports.listInventory = void 0;
const inventoryService = __importStar(require("../services/inventory.service"));
const response_1 = require("../utils/response");
const pagination_1 = require("../utils/pagination");
const listInventory = async (req, res) => {
    const { page, limit } = (0, pagination_1.getPagination)(req);
    const { data, total } = await inventoryService.getInventory(String(req.user._id), page, limit, req.query.search);
    (0, response_1.sendPaginated)(res, data, total, page, limit);
};
exports.listInventory = listInventory;
const createItem = async (req, res) => {
    const item = await inventoryService.createInventoryItem(String(req.user._id), req.body);
    (0, response_1.sendSuccess)(res, item, 'Inventory item created', 201);
};
exports.createItem = createItem;
const updateItem = async (req, res) => {
    const item = await inventoryService.updateInventoryItem(String(req.user._id), req.params.id, req.body);
    (0, response_1.sendSuccess)(res, item, 'Inventory item updated');
};
exports.updateItem = updateItem;
const deleteItem = async (req, res) => {
    await inventoryService.updateInventoryItem(String(req.user._id), req.params.id, { isActive: false });
    (0, response_1.sendSuccess)(res, null, 'Inventory item deleted');
};
exports.deleteItem = deleteItem;
const getLowStockAlerts = async (req, res) => {
    const items = await inventoryService.getLowStockAlerts(String(req.user._id));
    (0, response_1.sendSuccess)(res, items, 'Low stock items');
};
exports.getLowStockAlerts = getLowStockAlerts;
const getForecast = async (req, res) => {
    const forecast = await inventoryService.getInventoryForecast(String(req.user._id));
    (0, response_1.sendSuccess)(res, forecast, 'Inventory forecast');
};
exports.getForecast = getForecast;
//# sourceMappingURL=inventory.controller.js.map