export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const body = req.body || {};
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
  const extraPortDays =
    ((initialRate > 0 && revisedRate > 0) ? ((quantity / revisedRate) - (quantity / initialRate)) : 0) +
    additionalDays;

  const totalDays = extraSailing + extraPortDays;

  const vlsfoSea = extraSailing * ladenVLSFO;
  const vlsfoPort = ((extraPortDays - additionalDays) * workingVLSFO) + (additionalDays * idleVLSFO);
  const lsmgoSea = extraSailing * seaLSMGO;
  const lsmgoPort = extraPortDays * portLSMGO;

  const costVLSFO = (vlsfoSea + vlsfoPort) * vlsfoCostPerTon;
  const costLSMGO = (lsmgoSea + lsmgoPort) * lsmgoCostPerTon;

  const extraCost =
    ((totalDays * vesselHire) * (1 - (addcom / 100))) +
    costVLSFO +
    costLSMGO +
    extraExpenses;

  const additionalFreight = quantity > 0 ? extraCost / quantity : 0;
  const newFreight = baseFreight + additionalFreight;

  res.status(200).json({
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
}
