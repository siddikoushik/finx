export function validateNumber(n: number, fallback = 0): number {
	if (Number.isFinite(n) && n >= 0) return n;
	return fallback;
}

export function calculateEMI(principal: number, annualRatePercent: number, months: number): { emi: number; totalInterest: number; totalPayment: number; schedule: Array<{ month: number; emi: number; interest: number; principal: number; balance: number }>; } {
	const P = validateNumber(principal);
	const r = validateNumber(annualRatePercent) / 12 / 100;
	const n = Math.max(1, Math.floor(months));
	const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
	let balance = P;
	const schedule = [] as Array<{ month: number; emi: number; interest: number; principal: number; balance: number }>;
	let totalInterest = 0;
	for (let m = 1; m <= n; m++) {
		const interest = balance * r;
		const principalComp = emi - interest;
		balance = Math.max(0, balance - principalComp);
		totalInterest += interest;
		schedule.push({ month: m, emi, interest, principal: principalComp, balance });
	}
	return { emi, totalInterest, totalPayment: P + totalInterest, schedule };
}

export function compoundAmount(principal: number, annualRatePercent: number, years: number, frequency: number): number {
	const P = validateNumber(principal);
	const r = validateNumber(annualRatePercent) / 100;
	const t = validateNumber(years);
	const n = Math.max(1, Math.floor(frequency));
	return P * Math.pow(1 + r / n, n * t);
}

export function compoundInterest(principal: number, annualRatePercent: number, years: number, frequency: number) {
	const A = compoundAmount(principal, annualRatePercent, years, frequency);
	return { amount: A, interest: A - validateNumber(principal) };
}

export function simpleInterest(principal: number, annualRatePercent: number, years: number) {
	const P = validateNumber(principal);
	const r = validateNumber(annualRatePercent) / 100;
	const t = validateNumber(years);
	const interest = P * r * t;
	return { amount: P + interest, interest };
}

export function recurringDeposit(m: number, months: number, annualRatePercent: number, compoundingPerYear = 4) {
	const monthly = validateNumber(m);
	const n = Math.max(1, Math.floor(months));
	const r = validateNumber(annualRatePercent) / 100;
	const i = r / compoundingPerYear;
	const k = compoundingPerYear / 12;
	let maturity = 0;
	for (let j = 1; j <= n; j++) {
		const periods = Math.floor(k * (n - j + 1));
		maturity += monthly * Math.pow(1 + i, periods);
	}
	const totalDeposit = monthly * n;
	return { maturity, interest: maturity - totalDeposit, totalDeposit };
}

export function fixedDeposit(principal: number, months: number, annualRatePercent: number, compoundingPerYear = 4) {
	const years = validateNumber(months) / 12;
	const amount = compoundAmount(principal, annualRatePercent, years, compoundingPerYear);
	return { maturity: amount, interest: amount - validateNumber(principal), totalDeposit: validateNumber(principal) };
}

export function dailyDeposit(dailyAmount: number, totalDays: number, annualRatePercent: number) {
	const d = validateNumber(dailyAmount);
	const N = Math.max(1, Math.floor(totalDays));
	const r = validateNumber(annualRatePercent) / 100;
	const totalDeposit = d * N;
	// Approximate using average balance over the period (triangle series)
	const avgDays = N / 2;
	const interest = (d * avgDays) * (r / 365) * N; // simple approx
	const maturity = totalDeposit + interest;
	return { totalDeposit, interest, maturity };
}

export function chitFund(totalAmount: number, members: number, commissionPercent: number, durationMonths: number) {
	const T = validateNumber(totalAmount);
	const M = Math.max(1, Math.floor(members));
	const D = Math.max(1, Math.floor(durationMonths));
	const foremanRate = validateNumber(commissionPercent) / 100;
	const monthlyContribution = T / D;
	// Simplified model: bid discount linearly increases then stabilizes
	const rows = [] as Array<{ month: number; winner: number; bid: number; dividendPerMember: number; foremanFee: number }>;
	for (let m = 1; m <= D; m++) {
		const bidDiscount = 0.1 * (m / D); // up to 10%
		const bid = T * (1 - bidDiscount);
		const foremanFee = bid * foremanRate;
		const pool = M * monthlyContribution - foremanFee;
		const dividendPerMember = (pool - bid) / (M - 1);
		rows.push({ month: m, winner: ((m - 1) % M) + 1, bid, dividendPerMember, foremanFee });
	}
	return { monthlyContribution, table: rows };
}

export function goalPlanner(goalAmount: number, durationMonths: number, existingSavings: number, annualRatePercent = 7, compoundingPerYear = 12) {
	const G = Math.max(0, goalAmount - validateNumber(existingSavings));
	const n = Math.max(1, Math.floor(durationMonths));
	const r = validateNumber(annualRatePercent) / 100 / compoundingPerYear;
	// Future value of annuity: PMT * [((1+r)^n - 1)/r]
	const factor = (Math.pow(1 + r, n) - 1) / r;
	const requiredMonthly = G / factor;
	return { requiredMonthly };
}
