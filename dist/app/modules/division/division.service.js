"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionService = void 0;
const cloudinary_config_1 = require("../../config/cloudinary.config");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const division_constant_1 = require("./division.constant");
const division_model_1 = require("./division.model");
const createDivision = async (payload) => {
    const existingDivision = await division_model_1.Division.findOne({ name: payload.name });
    if (existingDivision) {
        throw new Error("A division with this name already exists.");
    }
    // const baseSlug = payload.name.toLowerCase().split(" ").join("-")
    // let slug = `${baseSlug}-division`
    // let counter = 0;
    // while (await Division.exists({ slug })) {
    //     slug = `${slug}-${counter++}` // dhaka-division-2
    // }
    // payload.slug = slug;
    const division = await division_model_1.Division.create(payload);
    return division;
};
const getAllDivisions = async (query) => {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(division_model_1.Division.find(), query);
    const divisionsData = queryBuilder
        .search(division_constant_1.divisionSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = await Promise.all([
        divisionsData.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
};
const getSingleDivision = async (slug) => {
    const division = await division_model_1.Division.findOne({ slug });
    return {
        data: division,
    };
};
const updateDivision = async (id, payload) => {
    const existingDivision = await division_model_1.Division.findById(id);
    if (!existingDivision) {
        throw new Error("Division not found.");
    }
    const duplicateDivision = await division_model_1.Division.findOne({
        name: payload.name,
        _id: { $ne: id },
    });
    if (duplicateDivision) {
        throw new Error("A division with this name already exists.");
    }
    // if (payload.name) {
    //     const baseSlug = payload.name.toLowerCase().split(" ").join("-")
    //     let slug = `${baseSlug}-division`
    //     let counter = 0;
    //     while (await Division.exists({ slug })) {
    //         slug = `${slug}-${counter++}` // dhaka-division-2
    //     }
    //     payload.slug = slug
    // }
    const updatedDivision = await division_model_1.Division.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (payload.thumbnail && existingDivision.thumbnail) {
        await (0, cloudinary_config_1.deleteImageFromCLoudinary)(existingDivision.thumbnail);
    }
    return updatedDivision;
};
const deleteDivision = async (id) => {
    await division_model_1.Division.findByIdAndDelete(id);
    return null;
};
exports.DivisionService = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision,
};
