"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const cc20Routes_1 = __importDefault(require("./routes/cc20Routes"));
const PORT = 3001;
const app = (0, express_1.default)();
app.use((0, body_parser_1.json)());
app.use("/cc20", cc20Routes_1.default);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
