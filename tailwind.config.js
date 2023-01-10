// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// eslint-disable-next-line no-undef
module.exports = {
	content: [
		// add the paths to all of your template files
		'./src/*.{jsx,tsx}',
		'./src/**/*.{jsx,tsx}'
	],
	important: true, // to generate utilities as !important
	plugins: [],
	theme: {
		extend: {
			colors: {
				'bg-main': '#1B2028',
				'bg-secondary': '#24272E',
				'failure': '#E63946',
				'highlight': '#1A2A42',
				'primary': '#1573FE',
				'success': '#06D6A0',
				'text_main': '#FFFFFF',
				'text_placeholder' : '#505050',
				'text_secondary': '#8B8B8B',
				'waiting': '#FF9F1C'
			},
			fontFamily: {
				// add new font family
				primary: ['Archivo', 'sans-serif']
			}
		}
	}
};
