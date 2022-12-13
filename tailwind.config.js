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
			boxShadow: {
				'secondary': '-2px 4px 6px #CAC9F9'
			},
			colors : {
				primary: '#645ADF',
				secondary: '#CAC9F9',
				tertiary: '#FAF4FF'
			}
		}
	}
};
