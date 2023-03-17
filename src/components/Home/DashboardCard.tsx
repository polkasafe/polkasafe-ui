// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { PlusCircleOutlined } from '@ant-design/icons';
import Identicon from '@polkadot/react-identicon';
import React, { useCallback, useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import brainIcon from 'src/assets/icons/brain-icon.svg';
import chainIcon from 'src/assets/icons/chain-icon.svg';
import dotIcon from 'src/assets/icons/image 39.svg';
import subscanIcon from 'src/assets/icons/subscan.svg';
import polkadotIcon from 'src/assets/parachains-icons/polkadot.svg';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IAsset } from 'src/types';
import AddressQr from 'src/ui-components/AddressQr';
import { CopyIcon, QRIcon, WalletIcon } from 'src/ui-components/CustomIcons';
import PrimaryButton from 'src/ui-components/PrimaryButton';
import copyText from 'src/utils/copyText';
import getEncodedAddress from 'src/utils/getEncodedAddress';

import ExistentialDeposit from '../SendFunds/ExistentialDeposit';
import SendFundsForm from '../SendFunds/SendFundsForm';

const DashboardCard = ({ className, setNewTxn }: { className?: string, setNewTxn: React.Dispatch<React.SetStateAction<boolean>>}) => {
	const { activeMultisig, multisigAddresses } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const { openModal, toggleVisibility } = useModalContext();
	const [assetsData, setAssetsData] = useState<IAsset[]>([]);

	// TODO: check why we're not using this
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [loading, setLoading] = useState(false);
	const [transactionLoading, setTransactionLoading] = useState(false);

	const handleNewTransaction = async () => {
		setTransactionLoading(true);

		// check if wallet exists onchain (has existential deposit)
		const isMultisigOnChainRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/isMultisigOnChain`, {
			body: JSON.stringify({
				multisigAddress: activeMultisig,
				network
			}),
			headers: firebaseFunctionsHeader(network),
			method: 'POST'
		});

		const { data: isMultisigOnChainData, error: isMultisigOnChainErr } = await isMultisigOnChainRes.json();
		if(isMultisigOnChainErr || !isMultisigOnChainData) {
			setTransactionLoading(false);
			return;
		}

		if(!isMultisigOnChainData.isOnChain) {
			openModal('Existential Deposit', <ExistentialDeposit />);
		} else {
			openModal('Send Funds', <SendFundsForm setNewTxn={setNewTxn} onCancel={() => toggleVisibility()} />);
		}

		setTransactionLoading(false);
	};

	const handleGetAssets = useCallback(async () => {
		try{
			const address = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!address || !signature || !activeMultisig) {
				return;
			}
			else{

				setLoading(true);
				const getAssestsRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getAssetsForAddress`, {
					body: JSON.stringify({
						address: activeMultisig,
						network
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data, error } = await getAssestsRes.json() as { data: IAsset[], error: string };

				if(error) {
					setLoading(false);
					return;
				}

				if(data){
					setAssetsData(data);
					setLoading(false);

				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	}, [activeMultisig, network]);

	useEffect(() => {
		handleGetAssets();
	}, [handleGetAssets]);

	return (
		<div>
			<h2 className="text-lg font-bold text-white">Overview</h2>
			<div className={`${className} bg-bg-main flex flex-col justify-between rounded-lg p-5 shadow-lg h-80 mt-3`}>
				<div className="flex justify-between">
					<div className='mb-3 w-full'>
						<div className='flex justify-between '>
							<div className='relative'>
								<Identicon
									className='border-2 rounded-full bg-transparent border-primary p-1.5'
									value={activeMultisig}
									size={70}
									theme='polkadot'
								/>
								<div className="bg-primary rounded-lg absolute -bottom-0 mt-3 left-[27px] text-white px-2">1/{multisigAddresses?.length}</div>
							</div>
							<div>
								<div className="flex gap-x-4 my-3 items-center">
									<a className='w-5' target='_blank' href={'https://polkadot.js.org/apps/#/accounts'} rel="noreferrer">
										<img className='w-5' src={polkadotIcon} alt="icon" />
									</a>
									<a className='w-5' target='_blank' href={`https://explorer.polkascan.io/${network}/account/${activeMultisig}`} rel="noreferrer">
										<img className='w-5' src={brainIcon} alt="icon" />
									</a>
									<a className='w-5' target='_blank' href={`https://dotscanner.com/${network}/account/${activeMultisig}?utm_source=polkadotjs`} rel="noreferrer">
										<img className='w-5 cursor-pointer' src={dotIcon} alt="icon" />
									</a>
									<a className='w-5' target='_blank' href={`https://${network}.polkaholic.io/account/${activeMultisig}?group=overview&chainfilters=all`} rel="noreferrer">
										<img className='w-5 cursor-pointer' src={chainIcon} alt="icon" />
									</a>
									<a className='w-5' target='_blank' href={`https://${network}.subscan.io/account/${activeMultisig}`} rel="noreferrer">
										<img className='w-5 cursor-pointer' src={subscanIcon} alt="icon" />
									</a>
								</div>
							</div>
						</div>
						<div>
							<div className='text-lg font-bold text-white'>{multisigAddresses.find(a => a.address == activeMultisig)?.name}</div>
							<div className="flex">
								<div className='text-md font-normal text-text_secondary'>{activeMultisig && getEncodedAddress(activeMultisig, network)}</div>
								<button className='ml-2 mr-1' onClick={() => copyText(activeMultisig, true, network)}><CopyIcon className='text-primary' /></button>
								<button onClick={() => openModal('Address Qr', <AddressQr address={activeMultisig} />)}>
									<QRIcon className='text-primary'/>
								</button>
							</div>
						</div>
					</div>
				</div>
				<div className="flex flex-wrap">
					<div className='m-2'>
						<div className='text-white'>Signatories</div>
						<div className='font-bold text-xl text-primary'>
							{multisigAddresses.find((item) => item.address === activeMultisig)?.signatories.length || 0}
						</div>
					</div>
					<div className='m-2'>
						<div className='text-white'>Tokens</div>
						<div className='font-bold text-xl text-primary'>{assetsData.length}</div>
					</div>
					<div className='m-2'>
						<div className='text-white'>USD Amount</div>
						<div className='font-bold text-xl text-primary'>
							{assetsData.reduce((total, item) => total + Number(item.balance_usd), 0).toFixed(2) || 'N/A'}
						</div>
					</div>
				</div>
				<div className="flex justify-around w-full mt-5">
					<PrimaryButton onClick={handleNewTransaction} loading={transactionLoading} className='w-[45%] flex items-center justify-center py-5 bg-primary text-white text-sm'>
						<PlusCircleOutlined /> New Transaction
					</PrimaryButton>
					<Link to='/assets' className='w-[45%] group'>
						<PrimaryButton className='w-[100%] flex items-center justify-center py-5 bg-highlight text-primary text-sm'><WalletIcon />View Assets</PrimaryButton>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default DashboardCard;

