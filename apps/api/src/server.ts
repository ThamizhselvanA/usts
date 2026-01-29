
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { startSyncWorker } from "./services/integrations/sync.service.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
  startSyncWorker();
});
