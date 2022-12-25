// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React, { FC } from 'react';
import { CopyIcon, DeleteIcon, EditIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';

export interface IOwner {
	name: string;
	address: string;
	imgSrc: string;
}
interface IListOwnersProps {
    owners: IOwner[];
}

const ListOwners: FC<IListOwnersProps> = ({ owners }) => {
	return (
		<div className='text-sm font-medium leading-[15px] '>
			<article className='grid grid-cols-4 bg-bg-secondary text-text_secondary py-5 px-4 rounded-lg'>
				<span className='col-span-1'>
					Name
				</span>
				<span className='col-span-2'>
					Address
				</span>
				<span className='col-span-1'>
					Action
				</span>
			</article>
			{
				owners.map(({ address, imgSrc, name }, index) => {
					return (
						<>
							<article className='grid grid-cols-4 py-6 px-4 text-white' key={index}>
								<p className='col-span-1 flex items-center'>
									{name}
								</p>
								<div className='col-span-2 flex items-center'>
									<div className='flex items-center justify-center overflow-hidden rounded-full w-4 h-4'>
										<img src={imgSrc} alt="profile img" />
									</div>
									<span className='ml-[6px]'>{address}</span>
									<div className='ml-[14px] text-text_secondary text-base flex items-center gap-x-[6px]'>
										<CopyIcon />
										<ExternalLinkIcon />
									</div>
								</div>
								<div className='col-span-1 flex items-center gap-x-[10px]'>
									<button className='text-primary bg-highlight flex items-center justify-center p-2 rounded-lg w-8 h-8'>
										<EditIcon className='' />
									</button>
									<button className='text-failure bg-failure bg-opacity-10 flex items-center justify-center p-2 rounded-lg w-8 h-8'>
										<DeleteIcon />
									</button>
								</div>
							</article>
							{owners.length - 1 !== index? <Divider className='bg-text_secondary my-0' />: null}
						</>
					);
				})
			}
		</div>
	);
};

export default ListOwners;