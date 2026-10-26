/**
 * Splitting a line total between the people who made it.
 *
 * Two rules, both non-negotiable:
 *   1. the parts must sum exactly to the whole — a split that loses a cent is a lie about money
 *   2. shares are integer basis points summing to 10000, so a listing cannot quietly promise 101%
 *
 * Rounding uses the largest-remainder method: everyone gets their floor, then the leftover cents go
 * to whoever was rounded down hardest. Deterministic, so two people computing the same split get
 * the same answer instead of arguing about a penny.
 */

export const BPS = 10000;

export function validateShares(shares) {
	if (!Array.isArray(shares) || !shares.length) throw new Error('a split needs at least one share');
	let sum = 0;
	for (const s of shares) {
		if (!s || typeof s.key !== 'string' || !s.key) throw new Error('each share needs a key');
		if (!Number.isInteger(s.bps) || s.bps < 0) throw new Error(`share "${s.key}" has a non-integer or negative bps`);
		sum += s.bps;
	}
	if (sum !== BPS) throw new Error(`shares must sum to ${BPS} bps, got ${sum}`);
	return true;
}

/**
 * @param {number} totalCents  the line total, integer cents
 * @param {{key:string,bps:number,label?:string}[]} shares
 * @returns {{rows:{key:string,label?:string,bps:number,amount:number}[], total:number}}
 */
export function distribute(totalCents, shares) {
	if (!Number.isInteger(totalCents) || totalCents < 0) throw new Error('total must be a non-negative integer number of cents');
	validateShares(shares);

	const parts = shares.map((s, i) => {
		const exact = (totalCents * s.bps) / BPS;      // safe: cents * 10000 stays well inside 2^53
		const floor = Math.floor(exact);
		return { key: s.key, label: s.label, bps: s.bps, amount: floor, frac: exact - floor, index: i };
	});

	let assigned = parts.reduce((n, p) => n + p.amount, 0);
	let leftover = totalCents - assigned;

	// largest remainder first; ties broken by declaration order so the result is stable
	const order = parts
		.slice()
		.sort((a, b) => (b.frac - a.frac) || (a.index - b.index));

	for (let i = 0; i < leftover; i++) order[i % order.length].amount += 1;

	const rows = parts.map(({ key, label, bps, amount }) => ({ key, label, bps, amount }));
	const sum = rows.reduce((n, r) => n + r.amount, 0);
	if (sum !== totalCents) throw new Error(`split lost money: ${sum} != ${totalCents}`);

	return { rows, total: totalCents };
}

/** Sum several line splits into one sheet, preserving exactness. */
export function combine(sheets) {
	const byKey = new Map();
	let total = 0;
	for (const sheet of sheets) {
		total += sheet.total;
		for (const r of sheet.rows) {
			const cur = byKey.get(r.key) || { key: r.key, label: r.label, bps: r.bps, amount: 0 };
			cur.amount += r.amount;
			byKey.set(r.key, cur);
		}
	}
	const rows = [...byKey.values()];
	const sum = rows.reduce((n, r) => n + r.amount, 0);
	if (sum !== total) throw new Error(`combined split lost money: ${sum} != ${total}`);
	return { rows, total };
}

/** The default split a listing carries unless its maker says otherwise. */
export const DEFAULT_SPLIT = [
	{ key: 'maker', label: 'Maker', bps: 8000 },
	{ key: 'platform', label: 'Platform', bps: 1200 },
	{ key: 'well', label: 'Wishing Well', bps: 500 },
	{ key: 'storyteller', label: 'Storyteller', bps: 300 }
];

export const money = (cents) => '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
