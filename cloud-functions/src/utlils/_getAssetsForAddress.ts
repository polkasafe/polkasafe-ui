import axios from 'axios';
import { responseMessages } from '../constants/response_messages';
import { SUBSCAN_API_HEADERS } from '../constants/subscan_consts';
import { tokenProperties } from '../constants/token_constants';
import { IAsset } from '../types';
import fetchTokenUSDValue from './fetchTokenUSDValue';
import formatBalance from './formatBalance';

interface IResponse {
	error?: string | null;
	data: IAsset[];
}

export default async function _getAssetsForAddress(address: string, network: string): Promise<IResponse> {
	const returnValue: IResponse = {
		error: '',
		data: []
	};

	try {
		const { data: response } = await axios.post(`https://${network}.api.subscan.io/api/scan/account/tokens`, {
			'address': address
		}, {
			headers: SUBSCAN_API_HEADERS
		});

		const assets: IAsset[] = [];

		if (response.data) {
			for (const assetType of Object.keys(response.data)) {
				for (const asset of response.data[assetType]) {
					const usdValue = await fetchTokenUSDValue(network);

					const newAsset: IAsset = {
						name: tokenProperties[asset.symbol as keyof typeof tokenProperties]?.name || '',
						logoURI: tokenProperties[asset.symbol as keyof typeof tokenProperties]?.logoURI || '',
						symbol: asset.symbol,
						// TODO: cache token usd value
						balance_usd: usdValue ?
							`${usdValue * Number(formatBalance(asset.balance, asset.decimals, { numberAfterComma: 2, withThousandDelimitor: false }))}` : '',
						balance_token: formatBalance(asset.balance, asset.decimals, { numberAfterComma: 2, withThousandDelimitor: false })
					};

					assets.push(newAsset);
				}
			}
		}

		returnValue.data = assets;
	} catch (err) {
		console.log('Error in _getAssetsForAddress:', err);
		returnValue.error = String(err) || responseMessages.assets_fetch_error;
	}

	return returnValue;
}

