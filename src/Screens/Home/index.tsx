// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { useEffect,useState } from 'react';
import AddressCard from 'src/components/Home/AddressCard';
import ConnectWallet from 'src/components/Home/ConnectWallet';
import ConnectWalletWrapper from 'src/components/Home/ConnectWallet/ConnectWalletWrapper';
import NewUserModal from 'src/components/Home/ConnectWallet/NewUserModal';
import DashboardCard from 'src/components/Home/DashboardCard';
import EmailBadge from 'src/components/Home/EmailBadge';
import TxnCard from 'src/components/Home/TxnCard';
import AddMultisig from 'src/components/Multisig/AddMultisig';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import CreateMultisig from 'src/components/Multisig/CreateMultisig';
import Loader from 'src/components/UserFlow/Loader';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';

const Home = () => {
	const { address, multisigAddresses, multisigSettings, createdAt, addressBook } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const [newTxn, setNewTxn] = useState<boolean>(false);
	const [openNewUserModal, setOpenNewUserModal] = useState(false);
	useEffect(() => {
		if((dayjs(createdAt) > dayjs().subtract(15, 'seconds')) && addressBook.length === 1){
			setOpenNewUserModal(true);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createdAt]);
	return (
		<>
			{
				address ?
					<>
						<NewUserModal open={openNewUserModal} onCancel={() => setOpenNewUserModal(false)} />
						{multisigAddresses && multisigAddresses.filter((multisig) => multisig.network === network && !multisigSettings?.[multisig.address]?.deleted).length > 0 ?
							<section>
								<EmailBadge/>
								<div className="grid grid-cols-16 gap-4 grid-row-2 lg:grid-row-1">
									<div className='col-start-1 col-end-13 xl:col-end-10'>
										<DashboardCard setNewTxn={setNewTxn} className='mt-3' />
									</div>
									<div className='col-start-1 col-end-13 xl:col-start-10'>
										<AddressCard className='mt-3' />
									</div>
								</div>
								<div className="grid grid-cols-12 gap-4 my-3 grid-row-2 lg:grid-row-1">
									<div className='col-start-1 col-end-13 lg:col-end-13'>
										<TxnCard newTxn={newTxn} />
									</div>
								</div>
							</section>
							:
							<section className='bg-bg-main p-5 rounded-lg h-full'>
								<section className='grid grid-cols-2 gap-x-5'>
									<Loader className='bg-primary col-span-1' />
									<Loader className='bg-primary col-span-1' />
								</section>
								<AddMultisig homepage />
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

export default Home;