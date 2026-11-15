import { port } from "./secret.js";
import connectDB from "./db/config/connectDB.js";

import server from "./app.js";

server.listen(port, "0.0.0.0", async () => {
  await connectDB();
  console.log(`Server is running at http://localhost:${port}`);
});
