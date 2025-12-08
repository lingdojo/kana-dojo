// Temporarily disable Google Fonts fetch during local builds/dev
// to avoid network timeouts in restricted environments.

// const fonts: Array<{ name: string; font?: unknown }> = [];

// export default fonts;
// > = [];

// export default fonts;

const fonts: Array<{ name: string; font: { className: string } }> = [
	{ name: 'Zen Maru Gothic', font: { className: '' } },
	{ name: 'Noto Sans JP', font: { className: '' } },
	{ name: 'Rampart One', font: { className: '' } },
];

export default fonts;