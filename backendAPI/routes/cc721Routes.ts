import { Router } from "express";
import { balanceOf, burn, mint, transfer } from "../controllers/cc721";

const cc721Routes = Router();

cc721Routes.get("/balance/:address", balanceOf);
cc721Routes.post("/mint", mint);
cc721Routes.post("/transfer", transfer);
cc721Routes.post("/burn", burn);
export default cc721Routes;
