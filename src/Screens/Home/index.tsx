// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { Button, notification } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import AddressCard from 'src/components/Home/AddressCard';
import ConnectWallet from 'src/components/Home/ConnectWallet';
import ConnectWalletWrapper from 'src/components/Home/ConnectWallet/ConnectWalletWrapper';
import NewUserModal from 'src/components/Home/ConnectWallet/NewUserModal';
import DashboardCard from 'src/components/Home/DashboardCard';
import TxnCard from 'src/components/Home/TxnCard';
import AddMultisig from 'src/components/Multisig/AddMultisig';
import Loader from 'src/components/UserFlow/Loader';
import { useGlobalWeb3Context } from 'src/context';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { returnTxUrl } from 'src/global/gnosisService';
import { GnosisSafeService } from 'src/services';
import { NotificationStatus } from 'src/types';
import { OutlineCloseIcon } from 'src/ui-components/CustomIcons';
import queueNotification from 'src/ui-components/QueueNotification';
import { createAdapter } from 'src/utils/web3';
import styled from 'styled-components';

const Home = () => {
	const { address, multisigAddresses, createdAt, addressBook, activeMultisig } = useGlobalUserDetailsContext();
	const [openNewUserModal, setOpenNewUserModal] = useState(false);
	const [hasProxy] = useState<boolean>(true);
	const [proxyNotInDb] = useState<boolean>(false);
	const [proxyInProcess] = useState<boolean>(false);

	const { web3AuthUser, ethProvider } = useGlobalWeb3Context();
	const { network } = useGlobalApiContext();

	const [transactionLoading] = useState(false);
	const [isOnchain, setIsOnchain] = useState(true);
	const [openTransactionModal, setOpenTransactionModal] = useState(false);

	useEffect(() => {
		if ((dayjs(createdAt) > dayjs().subtract(15, 'seconds')) && addressBook?.length === 1) {
			setOpenNewUserModal(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createdAt]);

	useEffect(() => {
		const handleNewTransaction = async () => {
			if (!activeMultisig) return;

			if (web3AuthUser) {
				const signer = ethProvider?.getSigner();
				const adapter = createAdapter('eth', signer);
				const txUrl = returnTxUrl(network);
				const gnosisService = new GnosisSafeService(adapter, signer, txUrl);

				const safeData = await gnosisService.getSafeCreationInfo(activeMultisig);

				if (safeData) {
					setIsOnchain(true);
				} else {
					setIsOnchain(false);
				}
			}
		};
		handleNewTransaction();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [web3AuthUser, ethProvider]);

	useEffect(() => {
		if (!isOnchain) {
			queueNotification({
				className: 'bg-bg-secondary border-2 border-solid border-primary text-white',
				closeIcon: (
					<div
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</div>
				),
				header: <span className='text-waiting'>No Existential Deposit</span>,
				message: <div className=''>
					<p>Please Add Existential Deposit to your Multisig to make it Onchain.</p>
					<div className='flex justify-end w-full'>
						<Button onClick={() => { setOpenTransactionModal(true); notification.destroy(); }} size='small' className='text-xs text-white bg-primary border-none outline-none'>Add Existential Deposit</Button>
					</div>
				</div>,
				placement: 'bottomRight',
				status: NotificationStatus.WARNING
			});
		}
	}, [isOnchain]);

	return (
		<>
			{
				address ?
					<>
						<NewUserModal open={openNewUserModal} onCancel={() => setOpenNewUserModal(false)} />
						{multisigAddresses.length > 0
							//&& multisigAddresses.filter((multisig) => multisig.network === network &&
							//!multisigSettings?.[multisig.address]?.deleted && !multisig.disabled).length > 0
							?
							<section>
								{!isOnchain ?
									<section className='mb-2 text-sm scale-[80%] w-[125%] h-[125%] origin-top-left border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
										<p className='text-white'>Please Add Existential Deposit to make Multisig Onchain.</p>
										<Button onClick={() => setOpenTransactionModal(true)} size='small' className='border-none outline-none text-waiting bg-transparent' >Add Existential Deposit</Button>
									</section>
									:
									proxyNotInDb ?
										<section className='mb-2 text-sm scale-[80%] w-[125%] h-[125%] origin-top-left text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
											<p className='text-white'>Your Proxy has been Created.</p>
											<Button onClick={() => window.location.reload()} size='small' className='border-none outline-none text-waiting bg-transparent' >Refresh</Button>
										</section>
										:
										proxyInProcess && !hasProxy ?
											<section className='mb-2 text-sm scale-[80%] w-[125%] h-[125%] origin-top-left w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
												<p className='text-white'>Your Proxy is Awaiting Approvals from other Signatories.</p>
											</section>
											:
											<></>
								}

								<div className="mb-0 grid grid-cols-16 gap-4 grid-row-2 lg:grid-row-1 h-auto">
									<div className='col-start-1 col-end-13 lg:col-end-8'>
										<DashboardCard transactionLoading={transactionLoading} isOnchain={isOnchain} setOpenTransactionModal={setOpenTransactionModal} openTransactionModal={openTransactionModal} hasProxy={hasProxy} setNewTxn={() => { }} />
									</div>
									<div className='col-start-1 col-end-13 lg:col-start-8 h-full'>
										<AddressCard />
									</div>
								</div>
								<div className="grid grid-cols-12 gap-4 grid-row-2 lg:grid-row-1">
									<div className='col-start-1 col-end-13 lg:col-end-13'>
										<TxnCard />
									</div>
								</div>
							</section>
							:
							<section className='bg-bg-main p-5 rounded-lg scale-90 w-[111%] h-[111%] origin-top-left'>
								<section className='grid grid-cols-2 gap-x-5'>
									<Loader className='bg-primary col-span-1' />
									<Loader className='bg-primary col-span-1' />
								</section>
								<AddMultisig className='mt-4' homepage />
							</section>}
					</>
					:
					<ConnectWalletWrapper>
						<ConnectWallet />
					</ConnectWalletWrapper>
			}
		</>
	);
};

export default styled(Home)`
	.ant-spin-nested-loading .ant-spin-blur{
		opacity: 0 !important;
	}
	.ant-spin-nested-loading .ant-spin-blur::after{
		opacity: 1 !important;
	}
`;