// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { Signer } from '@polkadot/api/types';
import Identicon from '@polkadot/react-identicon';
import { Spin } from 'antd';
import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import FailedTransactionLottie from 'src/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import SuccessTransactionLottie from 'src/assets/lottie-graphics/SuccessTransaction';
import CancelBtn from 'src/components/Multisig/CancelBtn';
import AddBtn from 'src/components/Multisig/ModalBtn';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import useGetAllAccounts from 'src/hooks/useGetAllAccounts';
import Balance from 'src/ui-components/Balance';
import { CheckOutlined, WarningCircleIcon } from 'src/ui-components/CustomIcons';
import formatBnBalance from 'src/utils/formatBnBalance';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import { transferAndProxyBatchAll } from 'src/utils/transferAndProxyBatchAll';
import styled from 'styled-components';

import Loader from '../UserFlow/Loader';

interface IMultisigProps {
	className?: string
	onCancel?: () => void
	homepage?: boolean
    signatories?: string[]
    threshold?: number
}

const AddProxy: React.FC<IMultisigProps> = ({ onCancel, signatories, threshold }) => {
	const { address: userAddress, multisigAddresses, activeMultisig, addressBook } = useGlobalUserDetailsContext();
	const { network, api, apiReady } = useGlobalApiContext();

	const { noAccounts, signersMap, accountsMap } = useGetAllAccounts();
	const [loading, setLoading] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>(false);
	const [failure, setFailure] = useState<boolean>(false);
	const [loadingMessages, setLoadingMessages] = useState<string>('');

	useEffect(() => {
		if(!api || !apiReady){
			return;
		}
		const reservedProxyDeposit = (api.consts.proxy.proxyDepositFactor as unknown as BN)
			.muln(1)
			.iadd(api.consts.proxy.proxyDepositBase as unknown as BN);
		console.log(reservedProxyDeposit.toString());
		console.log('format', formatBnBalance(reservedProxyDeposit, {}, network));
	}, [api, apiReady, network]);

	const createProxy = async () => {
		if(!api || !apiReady || noAccounts || !signersMap ) return;

		const encodedSender = getEncodedAddress(userAddress, network) || '';

		const wallet = accountsMap[encodedSender];
		if(!signersMap[wallet]) {console.log('no signer wallet'); return;}

		const signer: Signer = signersMap[wallet];
		api.setSigner(signer);

		const reservedProxyDeposit = (api.consts.proxy.proxyDepositFactor as unknown as BN)
			.muln(1)
			.iadd(api.consts.proxy.proxyDepositBase as unknown as BN);

		setLoading(true);
		setLoadingMessages('Please Sign To Create Your Multisig Proxy.');
		try {
			await transferAndProxyBatchAll({
				amount: reservedProxyDeposit,
				api,
				network,
				recepientAddress: activeMultisig,
				senderAddress: getSubstrateAddress(userAddress) || userAddress,
				setLoadingMessages,
				signatories: signatories ? signatories : multisigAddresses?.find((item) => item.address === activeMultisig)?.signatories || [],
				threshold: threshold ? threshold : multisigAddresses?.find((item) => item.address === activeMultisig)?.threshold || 2
			});
			setSuccess(true);
			setLoading(false);
			setTimeout(() => {
				setSuccess(false);
				onCancel?.();
			}, 7000);
		} catch (error) {
			console.log(error);
			setFailure(true);
			setLoading(false);
			setTimeout(() => setFailure(false), 5000);
		}
	};

	return (
		<>
			<Spin spinning={loading || success || failure} indicator={loading ? <LoadingLottie message={loadingMessages} /> : success ? <SuccessTransactionLottie message='Successful'/> : <FailedTransactionLottie message='Failed!' />}>
				<div className="flex justify-center gap-x-4 items-center mb-10 w-full">
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'><CheckOutlined/></div>
						<p className='text-text_secondary'>Create Multisig</p>
					</div>
					<Loader className='bg-primary h-[2px] w-[80px]'/>
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>2</div>
						<p>Create Proxy</p>
					</div>
				</div>
				<div className='text-primary mb-2'>Signed As</div>
				<div className='mb-4 p-[10px] border-2 border-dashed border-bg-secondary rounded-lg flex items-center gap-x-4'>
					<div className='flex items-center justify-center w-10 h-10'>
						<Identicon
							className='image identicon mx-2'
							value={userAddress}
							size={30}
							theme={'polkadot'}
						/>
					</div>
					<div className='flex flex-col gap-y-[6px]'>
						<h4 className='font-medium text-sm leading-[15px] text-white'>{addressBook?.find(a => a.address === userAddress)?.name }</h4>
						<p className='text-text_secondary font-normal text-xs leading-[13px]'>{userAddress}</p>
					</div>
					<Balance address={userAddress} />
				</div>

				<section className='mb-4 w-full text-waiting bg-waiting bg-opacity-10 p-3 rounded-lg font-normal text-xs leading-[16px] flex items-center gap-x-[11px]'>
					<span>
						<WarningCircleIcon className='text-base' />
					</span>
					<p>A small fees would be deducted from the sender account and approval would be required from threshold signatories to create a proxy.</p>
				</section>

				<div className='flex items-center justify-center gap-x-5 mt-[40px]'>
					<CancelBtn onClick={onCancel}/>
					<AddBtn title='Create Proxy' onClick={createProxy} />
				</div>
			</Spin>
		</>
	);
};

export default styled(AddProxy)`
	.ant-switch-inner-checked {
		background-color: #645ADF !important;
	}
`;
