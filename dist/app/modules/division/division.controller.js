"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const division_service_1 = require("./division.service");
const createDivision = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _a;
    const payload = Object.assign(Object.assign({}, req.body), { thumbnail: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path });
    const result = await division_service_1.DivisionService.createDivision(payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Division created",
        data: result,
    });
});
const getAllDivisions = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const query = req.query;
    const result = await division_service_1.DivisionService.getAllDivisions(query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Divisions retrieved",
        data: result.data,
        meta: result.meta,
    });
});
const getSingleDivision = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const slug = req.params.slug;
    const result = await division_service_1.DivisionService.getSingleDivision(slug);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Divisions retrieved",
        data: result.data,
    });
});
const updateDivision = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _a;
    const id = req.params.id;
    const payload = Object.assign(Object.assign({}, req.body), { thumbnail: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path });
    const result = await division_service_1.DivisionService.updateDivision(id, payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Division updated",
        data: result,
    });
});
const deleteDivision = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await division_service_1.DivisionService.deleteDivision(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Division deleted",
        data: result,
    });
});
exports.DivisionController = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision,
};
