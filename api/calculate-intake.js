export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const body = req.body || {};
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

  const tropicalOrSummer = tropical === "Yes" ? others : intakeQty;
  const basedOnInput = (qty * (1 + tol)) < tropicalOrSummer ? qty * (1 + tol) : tropicalOrSummer;
  const actualIntakeQty = basedOnInput < qtyAsPerGrain ? basedOnInput : qtyAsPerGrain;

  res.status(200).json({ result: actualIntakeQty });
}
