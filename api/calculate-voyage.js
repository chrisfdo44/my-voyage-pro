export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const body = req.body || {};
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

  const totalConsumption =
    (ladenDays * seaConsumption) +
    (ballastDays * seaConsumption) +
    (loadingTime * workingConsumption) +
    (dischargingTime * workingConsumption) +
    (extraDays * idleConsumption);

  const totalBunkerCost = totalConsumption * vlsfoRate;
  const totalExpenses = (totalDuration * hire * 0.9625) + totalBunkerCost + pda + otherExpenses;
  const freight = cargoQty > 0 ? (totalExpenses / cargoQty) * (1 + addcom/100) : 0;

  res.status(200).json({
    totalDuration,
    totalConsumption,
    totalBunkerCost,
    totalExpenses,
    freight
  });
}
