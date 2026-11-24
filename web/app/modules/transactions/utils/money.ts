export function formatMoney(amount: number, currency: 'PEN' | 'USD') {
	const value = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
	return `${currency === 'USD' ? 'US$' : 'S/'} ${value}`;
}
