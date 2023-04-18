// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
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
import AddProxy from 'src/components/Multisig/AddProxy';
import Loader from 'src/components/UserFlow/Loader';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { OutlineCloseIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

const Home = ({ className }: { className?: string }) => {
	const { address, multisigAddresses, multisigSettings, createdAt, addressBook, activeMultisig } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const [newTxn, setNewTxn] = useState<boolean>(false);
	const [openNewUserModal, setOpenNewUserModal] = useState(false);
	const [openProxyModal, setOpenProxyModal] = useState(false);
	const [hasProxy, setHasProxy] = useState<boolean>(true);
	const [proxyInProcess, setProxyInProcess] = useState<boolean>(false);
	useEffect(() => {
		if((dayjs(createdAt) > dayjs().subtract(15, 'seconds')) && addressBook?.length === 1){
			setOpenNewUserModal(true);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createdAt]);

	useEffect(() => {
		const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);
		if(multisig?.proxy){
			setHasProxy(true);
		}
		else{
			setHasProxy(false);
		}
	}, [activeMultisig, multisigAddresses]);

	const AddProxyModal: React.FC = () => {
		return (
			<>
				<Button onClick={() => setOpenProxyModal(true)} size='small' className='border-none outline-none text-waiting bg-transparent flex items-center' icon={<PlusCircleOutlined />} >Create Proxy</Button>
				<Modal
					centered
					footer={false}
					closeIcon={
						<button
							className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
							onClick={() => setOpenProxyModal(false)}
						>
							<OutlineCloseIcon className='text-primary w-2 h-2' />
						</button>}
					title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Create Proxy</h3>}
					open={openProxyModal}
					className={`w-auto md:min-w-[500px] ${className}`}
				>
					<AddProxy homepage onCancel={() => setOpenProxyModal(false)} />
				</Modal>
			</>
		);
	};

	return (
		<>
			{
				address ?
					<>
						<NewUserModal open={openNewUserModal} onCancel={() => setOpenNewUserModal(false)} />
						{multisigAddresses && multisigAddresses.filter((multisig) => multisig.network === network && !multisigSettings?.[multisig.address]?.deleted && !multisig.disabled).length > 0 ?
							<section>
								{!hasProxy && !proxyInProcess &&
									<section className='mb-4 w-full text-waiting bg-waiting bg-opacity-10 p-3 rounded-lg flex items-center gap-x-2'>
										<p className='text-white'>Create a proxy to edit or backup your Multisig.</p>
										<AddProxyModal/>
									</section>
								}
								<EmailBadge/>
								<div className="grid grid-cols-16 gap-4 grid-row-2 lg:grid-row-1">
									<div className='col-start-1 col-end-13 xl:col-end-8'>
										<DashboardCard hasProxy={hasProxy} setNewTxn={setNewTxn} className='mt-3' />
									</div>
									<div className='col-start-1 col-end-13 xl:col-start-8'>
										<AddressCard className='mt-3' />
									</div>
								</div>
								<div className="grid grid-cols-12 gap-4 my-3 grid-row-2 lg:grid-row-1">
									<div className='col-start-1 col-end-13 lg:col-end-13'>
										<TxnCard setProxyInProcess={setProxyInProcess} newTxn={newTxn} />
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

export default styled(Home)`
	.ant-spin-nested-loading .ant-spin-blur{
		opacity: 0 !important;
	}
	.ant-spin-nested-loading .ant-spin-blur::after{
		opacity: 1 !important;
	}
`;