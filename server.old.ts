import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("voyagepro.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT
  )
`);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "voyagepro_secret_key";

app.use(express.json());
app.use(cookieParser());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// API Routes
app.post("/api/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)");
    stmt.run(email, hashedPassword, name);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

app.get("/api/me", authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

// Calculation Endpoints
app.post("/api/calculate/intake", (req, res) => {
  const body = req.body;
  const dwt = Number(body.deadweight) || 0;
  const draft = Number(body.draft) || 0;
  const tpc = Number(body.tpc) || 0;
  const grainCap = Number(body.grainCapacity) || 0;
  const sf = Number(body.sf) || 0;
  const draftRes = Number(body.draftRestriction) || 0;
  const waterDen = Number(body.waterDensity) || 0;
  const vslConst = Number(body.vslConstant) || 0;
  const qty = Number(body.qty) || 0;
  const tolerance = Number(body.tolerance) || 0;
  const tropical = body.tropical;

  const tol = tolerance / 100;
  const qtyAsPerGrain = sf > 0 ? grainCap / sf : 0;
  const draftAsPerDensity = draftRes * waterDen / 1.025;
  const draftChange = draft < draftAsPerDensity ? 0 : draft - draftAsPerDensity;
  const dwtChange = draftChange * tpc * 100;
  const restrictedDwt = dwt - dwtChange;
  const intakeQty = restrictedDwt - vslConst;

  const tropicalDraft = draft * 49 / 48;
  const tropicalDwt = (tropicalDraft - draft) * tpc * 100 + dwt;
  const tropicalIntake = tropicalDwt - vslConst;

  let others;
  if (draftChange === 0) {
    if (draftRes > tropicalDraft) {
      others = tropicalIntake;
    } else {
      others = ((draftRes - draft) * tpc * 100) + dwt - vslConst;
    }
  } else {
    others = intakeQty;
  }

  const tropicalOrSummer = tropical === 'Yes' ? others : intakeQty;
  const basedOnInput = (qty * (1 + tol)) < tropicalOrSummer ? qty * (1 + tol) : tropicalOrSummer;
  const actualIntakeQty = basedOnInput < qtyAsPerGrain ? basedOnInput : qtyAsPerGrain;

  res.json({ result: actualIntakeQty });
});

app.post("/api/calculate/voyage", (req, res) => {
  const body = req.body;
  const cargoQty = Number(body.cargoQty) || 0;
  const ladenDays = Number(body.ladenDays) || 0;
  const ballastDays = Number(body.ballastDays) || 0;
  const seaConsumption = Number(body.seaConsumption) || 0;
  const workingConsumption = Number(body.workingConsumption) || 0;
  const idleConsumption = Number(body.idleConsumption) || 0;
  const loadRate = Number(body.loadRate) || 0;
  const dischargeRate = Number(body.dischargeRate) || 0;
  const extraDays = Number(body.extraDays) || 0;
  const vlsfoRate = Number(body.vlsfoRate) || 0;
  const pda = Number(body.pda) || 0;
  const otherExpenses = Number(body.otherExpenses) || 0;
  const hire = Number(body.hire) || 0;
  const addcom = Number(body.addcom) || 0;

  const loadingTime = loadRate > 0 ? cargoQty / loadRate : 0;
  const dischargingTime = dischargeRate > 0 ? cargoQty / dischargeRate : 0;
  const totalDuration = ladenDays + ballastDays + extraDays + loadingTime + dischargingTime;

  const totalConsumption = (ladenDays * seaConsumption) + (ballastDays * seaConsumption) +
                           (loadingTime * workingConsumption) + (dischargingTime * workingConsumption) +
                           (extraDays * idleConsumption);

  const totalBunkerCost = totalConsumption * vlsfoRate;
  const totalExpenses = (totalDuration * hire * 0.9625) + totalBunkerCost + pda + otherExpenses;
  const freight = cargoQty > 0 ? (totalExpenses / cargoQty) * (1 + addcom) : 0;

  res.json({
    totalDuration,
    totalConsumption,
    totalBunkerCost,
    totalExpenses,
    freight
  });
});

app.post("/api/calculate/ballast", (req, res) => {
  const body = req.body;
  const ballastDays = Number(body.ballastDays) || 0;
  const voyageDays = Number(body.voyageDays) || 0;
  const bunkerPrice = Number(body.bunkerPrice) || 0;
  const consumptionBallast = Number(body.consumptionBallast) || 0;
  const hireBssAps = Number(body.hireBssAps) || 0;
  const ballastBonus = Number(body.ballastBonus) || 0;

  if (voyageDays === 0) return res.json({ result: 0 });

  const grossDOPHire = ((((((voyageDays - ballastDays) * hireBssAps) * 95 / 100)) - ((bunkerPrice * consumptionBallast) * ballastDays) + ballastBonus) / voyageDays) / 0.95;

  res.json({ result: grossDOPHire });
});

app.post("/api/calculate/openbook", (req, res) => {
  const body = req.body;
  const baseFreight = Number(body.baseFreight) || 0;
  const quantity = Number(body.quantity) || 0;
  const initialRate = Number(body.initialRate) || 0;
  const revisedRate = Number(body.revisedRate) || 0;
  const additionalDays = Number(body.additionalDays) || 0;
  const extraMiles = Number(body.extraMiles) || 0;
  const extraExpenses = Number(body.extraExpenses) || 0;
  const ladenSpeed = Number(body.ladenSpeed) || 0;
  const ladenVLSFO = Number(body.ladenVLSFO) || 0;
  const seaLSMGO = Number(body.seaLSMGO) || 0;
  const idleVLSFO = Number(body.idleVLSFO) || 0;
  const workingVLSFO = Number(body.workingVLSFO) || 0;
  const portLSMGO = Number(body.portLSMGO) || 0;
  const vlsfoCostPerTon = Number(body.vlsfoCost) || 0;
  const lsmgoCostPerTon = Number(body.lsmgoCost) || 0;
  const vesselHire = Number(body.vesselHire) || 0;
  const addcom = Number(body.addcom) || 0;

  const extraSailing = ladenSpeed > 0 ? extraMiles / (ladenSpeed * 24) : 0;
  const extraPortDays = ((initialRate > 0 && revisedRate > 0) ? ((quantity / revisedRate) - (quantity / initialRate)) : 0) + additionalDays;
  const totalDays = extraSailing + extraPortDays;

  const vlsfoSea = extraSailing * ladenVLSFO;
  const vlsfoPort = ((extraPortDays - additionalDays) * workingVLSFO) + (additionalDays * idleVLSFO);
  const lsmgoSea = extraSailing * seaLSMGO;
  const lsmgoPort = extraPortDays * portLSMGO;

  const costVLSFO = (vlsfoSea + vlsfoPort) * vlsfoCostPerTon;
  const costLSMGO = (lsmgoSea + lsmgoPort) * lsmgoCostPerTon;

  const extraCost = ((totalDays * vesselHire) * (1 - (addcom / 100))) + costVLSFO + costLSMGO + extraExpenses;
  const additionalFreight = quantity > 0 ? extraCost / quantity : 0;
  const newFreight = baseFreight + additionalFreight;

  res.json({
    extraSailing,
    extraPortDays,
    totalDays,
    vlsfoSea,
    vlsfoPort,
    lsmgoSea,
    lsmgoPort,
    costVLSFO,
    costLSMGO,
    extraCost,
    additionalFreight,
    newFreight
  });
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
