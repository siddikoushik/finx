// Locale-aware number and currency formatting utilities

export function formatCurrency(amount: number, currency: string = 'INR', locale?: string): string {
	if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '₹0';
	try {
		const formatter = new Intl.NumberFormat(locale, {
			style: 'currency',
			currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		});
		return formatter.format(Number(amount));
	} catch {
		// Fallback to Indian format
		return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount));
	}
}

export function formatNumber(number: number, locale?: string): string {
	if (number === null || number === undefined || Number.isNaN(Number(number))) return '0';
	try {
		return new Intl.NumberFormat(locale).format(Number(number));
	} catch {
		return new Intl.NumberFormat('en-IN').format(Number(number));
	}
}

// Backward compatibility helpers
export function formatIndianCurrency(amount: number): string {
	return formatCurrency(amount, 'INR', 'en-IN');
}

export function formatIndianNumber(number: number): string {
	return formatNumber(number, 'en-IN');
}

export function parseFormattedNumber(formattedString: string): number {
	if (!formattedString) return 0;
	const cleanString = String(formattedString).replace(/[^0-9.\-]/g, '');
	return parseFloat(cleanString) || 0;
}
