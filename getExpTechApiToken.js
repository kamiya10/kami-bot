import "dotenv/config";
import { hostname, machine,platform,release } from "os";
import { ExpTechApi } from "@exptechtw/api-wrapper";
import pkg from "./package.json" with { type:"json" };
import { stdout } from "process";

const api = new ExpTechApi();

await api
  .getAuthToken({
    email: process.env.EXPTECH_ACCOUNT,
    password: process.env.EXPTECH_PASSWORD,
    name: `${hostname()}/KamiBot/${pkg.version}/${platform()}_${release()}_${machine()}`
  })
  .then(v=>stdout.write(v))
  .catch(console.error);