// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SwapOutlined } from '@ant-design/icons';
import { Badge, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { chainProperties } from 'src/global/networkConstants';
import useGetAllAccounts from 'src/hooks/useGetAllAccounts';
import { IAddressBookItem } from 'src/types';
import { WarningCircleIcon } from 'src/ui-components/CustomIcons';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import { inputToBn } from 'src/utils/inputToBn';

import NewUserModal from '../Home/ConnectWallet/NewUserModal';

interface ISignature{
	name: string
	address: string
	key: number,
	balance?: string
}

interface ISignatoryProps{
	setSignatories: React.Dispatch<React.SetStateAction<string[]>>
	signatories: string[]
	filterAddress?: string
	homepage: boolean

}

const Signatory = ({ filterAddress, setSignatories, signatories, homepage }: ISignatoryProps) => {

	const { address, addressBook } = useGlobalUserDetailsContext();
	const { network, api, apiReady } = useGlobalApiContext();
	const { accounts } = useGetAllAccounts();

	const [addWalletAddress, setAddWalletAddress] = useState<boolean>(false);

	const [addresses, setAddresses] = useState<ISignature[]>(addressBook?.filter((item, i) => i !== 0 && (filterAddress ? (item.address.includes(filterAddress, 0) || item.name.includes(filterAddress, 0)) : true)).map((item: IAddressBookItem, i: number) => ({
		address: item.address,
		key: i+1,
		name: item.name
	})));

	useEffect(() => {
		if(!api || !apiReady){
			return;
		}
		const fetchBalances = async () => {
			const results = await Promise.allSettled(addresses.map((item) => api.query.system.account(item.address)));
			results.forEach((result, i) => {
				if(result.status === 'fulfilled'){
					const balance = result.value;
					setAddresses((prev) => {
						const copyPrev = [...prev];
						const copyObj = copyPrev[i];
						copyObj!.balance = balance?.data?.free?.toString();
						return copyPrev;
					});
				}
			});
		};
		fetchBalances();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ api, apiReady]);

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

	const clickDropReturn = (event:any) => {
		event.preventDefault();
		const data = event.target.id;
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

	const clickDrop = async (event: any) => {
		event.preventDefault();
		const data = event.target.id;
		const address = `${data}`.split('-')[1];

		const substrateAddress = getSubstrateAddress(address);
		if(!substrateAddress || !api || !apiReady) return; //is invalid

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
			<NewUserModal open={addWalletAddress} onCancel={() => setAddWalletAddress(false)} />
			<div className="flex w-[100%] items-center justify-center">
				<div id='div1' className="flex flex-col my-2 w-1/2 mr-1 cursor-grab" onDrop={dropReturn} onDragOver={dragOver}>
					<h1 className='text-primary mt-3 mb-2'>Available Signatory</h1>
					<div id={`drop1${homepage && '-home'}`} className='flex flex-col bg-bg-secondary p-4 rounded-lg my-1 h-[30vh] overflow-y-auto'>
						{addresses.length > 0 ? addresses.map((address) => {
							const lowBalance = address.balance && Number(address.balance) < Number(inputToBn(`${chainProperties[network].existentialDeposit}`, network)[0]);
							return (
								<p onClick={signatories.includes(address.address) ? clickDropReturn : clickDrop} title={getEncodedAddress(address.address, network) || ''} id={`${address.key}-${address.address}`} key={`${address.key}-${address.address}`} className='bg-bg-main p-2 m-1 rounded-md text-white flex items-center gap-x-2' draggable onDragStart={dragStart}>
									{address.name}
									{lowBalance && signatories.includes(address.address) &&
										<Tooltip title={
											<div className='text-text_secondary'>
												<div className='text-bold text-lg text-white mb-3'>Insufficient Balance</div>
												<div>This account does not have sufficient balance in their account to sign the transaction for creation of proxy</div>
												<div className='mt-2 text-primary'><a href='https://polkadot.js.org/apps/#/accounts' target='_blank' rel="noreferrer">Send Funds</a></div>
											</div>
										}>
											<WarningCircleIcon className='text-base' />
										</Tooltip>
									}
								</p>
							);})
							:
							// <Tooltip title='Import Addresses From Your Wallet.'>
							// <Button onClick={() => setAddWalletAddress(true)} className='bg-primary flex items-center justify-center border-none outline-none text-white w-full' icon={<AddIcon/>}>
							// Import
							// </Button>
							// </Tooltip>
							<>
								<div className='text-sm text-text_secondary'>Addresses imported directly from your Polkadot.js wallet</div>
								{accounts.map((account, i) => (
									<p onClick={signatories.includes(account.address) ? clickDropReturn : clickDrop} title={getEncodedAddress(account.address, network) || ''} id={`${i+1}-${account.address}`} key={`${i+1}-${account.address}`} className='bg-bg-main p-2 m-1 rounded-md text-white' draggable onDragStart={dragStart}>{account.name}</p>
								))}
							</>
						}
					</div>
				</div>
				<SwapOutlined className='text-primary' />
				<div id='div2' className="flex flex-col my-2 pd-2 w-1/2 ml-2">
					<h1 className='text-primary mt-3 mb-2'>Selected Signatory</h1>
					<div id={`drop2${homepage && '-home'}`} className='flex flex-col bg-bg-secondary p-2 rounded-lg my-1 h-[30vh] overflow-auto cursor-grab' onDrop={drop} onDragOver={dragOver}>
						<p title={getEncodedAddress(address, network) || ''} id={`0-${signatories[0]}`} key={`0-${signatories[0]}`} className='bg-bg-main p-2 m-1 rounded-md text-white cursor-default flex items-center gap-x-2'>{addressBook[0]?.name} <Tooltip title={<span className='text-sm text-text_secondary'>Your Wallet Address</span>}><Badge status='success' /></Tooltip></p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Signatory;