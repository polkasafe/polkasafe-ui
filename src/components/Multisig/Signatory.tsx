// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SwapOutlined } from '@ant-design/icons';
import React from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_USER_ADDRESS_NAME } from 'src/global/default';
import { IAddressBookEntry } from 'src/types';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';

interface ISignature{
	name: string
	address: string
	key: number
}

interface ISignatoryProps{
	setSignatories: React.Dispatch<React.SetStateAction<string[]>>
	signatories: string[]
	filterAddress?: string
	homepage: boolean

}

const Signatory = ({ filterAddress, setSignatories, signatories, homepage }: ISignatoryProps) => {

	const { address, addressBook } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();

	const addresses: ISignature[] = addressBook.filter((item, i) => i !== 0 && (filterAddress ? (item.address.includes(filterAddress, 0) || item.name.includes(filterAddress, 0)) : true)).map((item: IAddressBookEntry, i: number) => ({
		address: item.address,
		key: i+1,
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

		const substrateAddress = getSubstrateAddress(address);
		if(!substrateAddress) return; //is invalid

		setSignatories((prevState) => {
			if(prevState.includes(substrateAddress)){
				return prevState;
			}
			else{
				return [
					...prevState,
					substrateAddress
				];
			}
		});

		const drop2 = document.getElementById(`drop2${homepage && '-home'}`);
		if(data) {drop2?.appendChild(document.getElementById(data)!);}

	};

	const dropReturn = (event:any) => {
		event.preventDefault();
		const data = event.dataTransfer.getData('text');
		const address = `${data}`.split('-')[1];

		const substrateAddress = getSubstrateAddress(address);
		if(!substrateAddress) return; //is invalid

		if(signatories.includes(substrateAddress)){
			setSignatories((prevState) => {
				const copyState = [...prevState];
				const index = copyState.indexOf(substrateAddress);
				copyState.splice(index, 1);
				return copyState;
			});
		}
		const drop1 = document.getElementById(`drop1${homepage && '-home'}`);
		if(data) {drop1?.appendChild(document.getElementById(data)!);}
	};

	const clickDrop = (event: any) => {
		event.preventDefault();
		const data = event.target.id;
		const address = `${data}`.split('-')[1];

		const substrateAddress = getSubstrateAddress(address);
		if(!substrateAddress) return; //is invalid

		setSignatories((prevState) => {
			if(prevState.includes(substrateAddress)){
				return prevState;
			}
			else{
				return [
					...prevState,
					substrateAddress
				];
			}
		});

		const drop2 = document.getElementById(`drop2${homepage && '-home'}`);
		if(data) {drop2?.appendChild(document.getElementById(data)!);}
	};

	return (
		<div className="flex w-[45vw]">
			<div className="flex w-[100%] items-center justify-center">
				<div id='div1' className="flex flex-col my-2 w-1/2 mr-1 cursor-grab" onDrop={dropReturn} onDragOver={dragOver}>
					<h1 className='text-primary mt-3 mb-2'>Available Signatory</h1>
					<div id={`drop1${homepage && '-home'}`} className='flex flex-col bg-bg-secondary p-4 rounded-lg my-1 h-[30vh] overflow-auto'>
						{addresses.map((address) => (
							<p onClick={clickDrop} title={getEncodedAddress(address.address, network) || ''} id={`${address.key}-${address.address}`} key={`${address.key}-${address.address}`} className='bg-bg-main p-2 m-1 rounded-md text-white' draggable onDragStart={dragStart}>{address.name}</p>
						))}
					</div>
				</div>
				<SwapOutlined className='text-primary' />
				<div id='div2' className="flex flex-col my-2 pd-2 w-1/2 ml-2">
					<h1 className='text-primary mt-3 mb-2'>Selected Signatory</h1>
					<div id={`drop2${homepage && '-home'}`} className='flex flex-col bg-bg-secondary p-2 rounded-lg my-1 h-[30vh] overflow-auto cursor-grab' onDrop={drop} onDragOver={dragOver}>
						<p title={getEncodedAddress(address, network) || ''} id={`0-${signatories[0]}`} key={`0-${signatories[0]}`} className='bg-bg-main p-2 m-1 rounded-md text-white cursor-default'>{DEFAULT_USER_ADDRESS_NAME}</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Signatory;