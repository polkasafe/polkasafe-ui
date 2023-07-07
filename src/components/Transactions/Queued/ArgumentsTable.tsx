// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
// import getSubstrateAddress from 'src/utils/getSubstrateAddress';
// import shortenAddress from 'src/utils/shortenAddress';

interface IArgumentsTableProps {
	className?: string,
	argumentsJSON: any,
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

const ArgumentsTable: FC<IArgumentsTableProps> = ({ argumentsJSON }) => {
	if (!argumentsJSON) return null;
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
										<ArgumentsTable argumentsJSON={value} />
									</td>
							}
						</tr>
					</div>
				);
			})}
		</>
	);
};

export default ArgumentsTable;