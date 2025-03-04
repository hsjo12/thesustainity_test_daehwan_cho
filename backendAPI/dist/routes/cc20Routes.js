"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cc20_1 = require("../controllers/cc20");
const cc20Routes = (0, express_1.Router)();
cc20Routes.get("/balance/:address", cc20_1.balanceOf);
cc20Routes.post("/mint", cc20_1.mint);
exports.default = cc20Routes;
