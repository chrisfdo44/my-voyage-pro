export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const body = req.body || {};
  const ballastDays = Number(body.ballastDays) || 0;
  const voyageDays = Number(body.voyageDays) || 0;
  const bunkerPrice = Number(body.bunkerPrice) || 0;
  const consumptionBallast = Number(body.consumptionBallast) || 0;
  const hireBssAps = Number(body.hireBssAps) || 0;
  const ballastBonus = Number(body.ballastBonus) || 0;

  if (voyageDays === 0) return res.status(200).json({ result: 0 });

  const grossDOPHire =
    ((((((voyageDays - ballastDays) * hireBssAps) * 95 / 100)) -
      ((bunkerPrice * consumptionBallast) * ballastDays) +
      ballastBonus) / voyageDays) / 0.95;

  res.status(200).json({ result: grossDOPHire });
}
