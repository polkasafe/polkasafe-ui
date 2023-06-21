import { networkTrackInfo } from './trackInfo';

export const getTrackName = (network: string, trackId: number, fellowshipOrigin:boolean) => {
	if (networkTrackInfo[network]) {
		return '';
	}
	const tracksObj = networkTrackInfo[network];
	let name = '';
	if (tracksObj) {
		Object.values(tracksObj).forEach((obj) => {
			if (obj.trackId === trackId && obj.fellowshipOrigin === fellowshipOrigin) {
				name = obj.name;
			}
		});
	}
	return name.split('_').map((a:string) => a.charAt(0).toUpperCase()+a.slice(1)).join(' ');
};
