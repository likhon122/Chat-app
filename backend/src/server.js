import { port } from "./secret.js";
import connectDB from "./db/config/connectDB.js";

import app from "./app.js";

app.listen(port, async () => {
  await connectDB();
  console.log(`Server is running at http://localhost:${port}`);
});
