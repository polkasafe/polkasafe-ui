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
			backgroundImage:{
				'gradient-primary': 'linear-gradient(180deg, #CAC9F9 0%, #332D82 100%)'
			},
			boxShadow: {
				'large': '-3px 4px 10px #CAC9F9',
				'siderBox': '-6px 10px 10px rgba(0, 0, 0, 0.23)',
				'small': '-2px 3px 6px #CAC9F9',
				'top': '0px -3px 4px #CAC9F9'
			},
			colors: {
				black_full: '#000',
				black_primary: 'rgba(0, 0, 0, 0.9)',
				black_text: '#1F1F1F',
				blue_primary: '#645ADF',
				blue_primary1: '#EBEBFF',
				blue_secondary: '#CAC9F9',
				gray_primary: '#f6f7fE',
				gray_primary1: '#FBFAFC',
				gray_secondary: '#F5F5F5',
				purple_app_bg: '#F6F7FE',
				red_primary: '#C82929'
			},
			fontFamily: {
				// add new font family
				primary: ['DM Sans']
			}
		}
	}
};
