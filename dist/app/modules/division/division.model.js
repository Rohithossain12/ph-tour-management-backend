"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Division = void 0;
const mongoose_1 = require("mongoose");
const divisionSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    thumbnail: { type: String },
    description: { type: String }
}, {
    timestamps: true
});
divisionSchema.pre("save", async function (next) {
    if (this.isModified("name")) {
        const baseSlug = this.name.toLowerCase().split(" ").join("-");
        let slug = `${baseSlug}-division`;
        let counter = 0;
        while (await exports.Division.exists({ slug })) {
            slug = `${slug}-${counter++}`;
        }
        this.slug = slug;
    }
    next();
});
divisionSchema.pre("findOneAndUpdate", async function (next) {
    const division = this.getUpdate();
    if (division.name) {
        if (division.name) {
            const baseSlug = division.name.toLowerCase().split(" ").join("-");
            let slug = `${baseSlug}-division`;
            let counter = 0;
            while (await exports.Division.exists({ slug })) {
                slug = `${slug}-${counter++}`;
            }
            division.slug = slug;
        }
    }
    this.setUpdate(division);
    next();
});
exports.Division = (0, mongoose_1.model)("Division", divisionSchema);
