import express from "express";
import { json } from "body-parser";
import cc20Routes from "./routes/cc20Routes";
import cc721Routes from "./routes/cc721Routes";
const PORT = 3001;

const app = express();

app.use(json());
app.use("/", cc20Routes);
app.use("/nft", cc721Routes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
