// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SwapOutlined } from '@ant-design/icons';
import React from 'react';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { IAddressBookEntry } from 'src/types';

interface ISignature{
	name: string
	address: string
	key: number
}

interface ISignatoryProps{
	setSignatories?: React.Dispatch<React.SetStateAction<string[]>>

}

const Signotary = ({ setSignatories }: ISignatoryProps) => {

	const { addressBook } = useGlobalUserDetailsContext();

	const signatures: ISignature[] = addressBook.map((item: IAddressBookEntry, i: number) => ({
		address: item.address,
		key: i,
		name: item.name
	}));
	const dragStart = (event:any) => {
		event.dataTransfer.setData('text', event.target.id);
	};

	const dragOver = (event:any) => {
		event.preventDefault();
	};

	const drop = (event:any) => {
		event.preventDefault();
		const data = event.dataTransfer.getData('text');
		const address = `${data}`.split('-')[1];
		if(setSignatories){
			setSignatories((prevState) => {
				return [
					...prevState,
					address
				];
			});

		}
		event.target.appendChild(document.getElementById(data));
	};
	return (
		<div className="flex w-[45vw]">
			<div className="flex w-[100%] items-center justify-center">
				<div id='div1' className="flex flex-col my-2 w-1/2 mr-1" onDrop={drop} onDragOver={dragOver}>
					<h1 className='text-primary mt-3 mb-2'>Available Signatory</h1>
					<div className='flex flex-col bg-bg-secondary p-4 rounded-lg my-1 h-[30vh] overflow-auto'>
						{signatures.map((signature) => (
							<p id={`${signature.key}-${signature.address}`} key={`${signature.key}-${signature.address}`} className='bg-bg-main p-2 m-1 rounded-md text-white' draggable onDragStart={dragStart}>{signature.name}</p>
						))}
					</div>
				</div>
				<SwapOutlined className='text-primary' />
				<div id='div2' className="flex flex-col my-2 pd-2 w-1/2 ml-2">
					<h1 className='text-primary mt-3 mb-2'>Selected Signatory</h1>
					<div className='flex flex-col bg-bg-secondary p-2 rounded-lg my-1 h-[30vh] overflow-auto' onDrop={drop} onDragOver={dragOver}>
						<p></p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Signotary;