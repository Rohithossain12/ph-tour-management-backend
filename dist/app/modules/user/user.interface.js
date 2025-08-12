"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsActive = exports.Role = void 0;
var Role;
(function (Role) {
    Role["SUPPER_ADMIN"] = "SUPPER_ADMIN";
    Role["ADMIN"] = "ADMIN";
    Role["USER"] = "USER";
    Role["GUIDE"] = "GUIDE";
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
})(Role || (exports.Role = Role = {}));
var IsActive;
(function (IsActive) {
    IsActive["ACTIVE"] = "ACTIVE";
    IsActive["INACTIVE"] = "INACTIVE";
    IsActive["BLOCKED"] = "BLOCKED";
})(IsActive || (exports.IsActive = IsActive = {}));
