// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
const webpack = require('webpack');

module.exports = function override(config) {
	const fallback = config.resolve.fallback || {};
	Object.assign(fallback, {
		crypto: require.resolve('crypto-browserify'),
		stream: require.resolve('stream-browserify'),
		assert: require.resolve('assert'),
		http: require.resolve('stream-http'),
		https: require.resolve('https-browserify'),
		os: require.resolve('os-browserify'),
		url: require.resolve('url'),
		zlib: require.resolve('browserify-zlib'),
		path: require.resolve("path-browserify"),
		tls: false,
		fs: false
	});
	config.resolve.fallback = fallback;
	config.plugins = (config.plugins || []).concat([
		new webpack.ProvidePlugin({
			process: 'process/browser',
			Buffer: ['buffer', 'Buffer']
		})
	]);
	config.ignoreWarnings = [/Failed to parse source map/];
	config.module.rules.push({
		test: /\.(js|mjs|jsx)$/,
		enforce: 'pre',
		loader: require.resolve('source-map-loader'),
		resolve: {
			fullySpecified: false
		}
	});
	return config;
};