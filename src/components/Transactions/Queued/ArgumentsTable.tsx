// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useEffect, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import decodeCallData from 'src/utils/decodeCallData';
// import getSubstrateAddress from 'src/utils/getSubstrateAddress';
// import shortenAddress from 'src/utils/shortenAddress';

interface IArgumentsTableProps {
	className?: string,
	callData: string
}

const urlRegex = /(https?:\/\/[^\s]+)/g;

const constructAnchorTag = (value: string) => {
	if (value && typeof value === 'string') {
		const urls = value.match(urlRegex);
		if (urls && Array.isArray(urls)) {
			urls?.forEach((url) => {
				if (url && typeof url === 'string') {
					value = value.replace(url, `<a class="text-bg-primary" href='${url}' target='_blank'>${url}</a>`);
				}
			});
		}
		// else if(getSubstrateAddress(value)){
		// value = value.replace(value, shortenAddress(value));
		// }
	}
	return value;
};

const Arguments = ({ argumentsJSON }: { argumentsJSON: any }) => {
	if(argumentsJSON) return null;
	return (
		<>
			{Object.entries(argumentsJSON).map(([name, value], index) => {

				// eslint-disable-next-line no-tabs
				return	(
					<div key={index}>
						<tr className='grid grid-cols-4 border-b border-solid border-bg-secondary gap-x-2 text-white'>
							<td className='sm:w-auto p-2 border-r border-solid border-bg-secondary truncate col-span-1 flex items-center text-sm'>
								{name}
							</td>
							{
								typeof value !== 'object'?
									<td dangerouslySetInnerHTML={{
										__html: constructAnchorTag(value as any)
									}} className=' p-2 col-span-3 truncate text-sm'/>
									: <td className='sm:w-auto col-span-3 text-sm'>
										<Arguments argumentsJSON={value} />
									</td>
							}
						</tr>
					</div>
				);
			})}
		</>
	);
};

const ArgumentsTable: FC<IArgumentsTableProps> = ({ callData, className }) => {

	const { api, apiReady, network } = useGlobalApiContext();

	const [decodedCallData, setDecodedCallData] = useState<any>();
	const [txnParams, setTxnParams] = useState<{ method: string, section: string }>({} as any);

	useEffect(() => {
		if(!api || !apiReady || !callData) return;

		const { data, error } = decodeCallData(callData, api);
		if(error || !data) return;

		setDecodedCallData(data.extrinsicCall?.toJSON());

		const callDataFunc = data.extrinsicFn;
		setTxnParams({ method: `${callDataFunc?.method}`, section:  `${callDataFunc?.section}` });

	}, [api, apiReady, callData, network]);
	return (
		<>
			<div className='flex items-center gap-x-5 justify-between'>
				<span className='text-text_secondary font-normal text-sm leading-[15px]'>Section:</span>
				<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
					<span className='text-white font-normal text-sm leading-[15px]'> {txnParams?.section}</span>
				</p>
			</div>
			<div className='flex items-center gap-x-5 justify-between mt-3'>
				<span className='text-text_secondary font-normal text-sm leading-[15px]'>Method:</span>
				<p className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'>
					<span className='text-white font-normal text-sm leading-[15px]'> {txnParams?.method}</span>
				</p>
			</div>
			<table cellSpacing={0} cellPadding={0} className={`w-full mt-3 ${className}`}>
				<article className='grid grid-cols-4 gap-x-2 bg-bg-secondary text-text_secondary py-2 px-2 rounded-t-md'>
					<span className='col-span-1'>
						Name
					</span>
					<span className='col-span-3'>
						Value
					</span>
				</article>
				{decodedCallData && decodedCallData?.args &&
				<tbody className='border-l border-r border-solid border-bg-secondary'>
					<Arguments argumentsJSON={decodedCallData.args} />
				</tbody>}
			</table>
		</>
	);
};

export default ArgumentsTable;