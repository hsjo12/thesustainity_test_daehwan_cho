import { Router } from "express";
import { balanceOf, burn, mint, transfer } from "../controllers/cc20";

const cc20Routes = Router();

cc20Routes.get("/balance/:address", balanceOf);
cc20Routes.post("/mint", mint);
cc20Routes.post("/transfer", transfer);
cc20Routes.post("/burn", burn);
export default cc20Routes;
