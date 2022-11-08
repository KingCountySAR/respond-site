import * as dotenv from "dotenv";
dotenv.config({ path: '.env.local' });
dotenv.config();
import Server from "./src/server";

new Server().boot();