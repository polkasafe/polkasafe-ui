// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Drawer, Layout } from 'antd';
import { Badge } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import polkasafeLogo from 'src/assets/icons/polkasafe.svg';
import longIframe from 'src/assets/long-iframe.svg';
import shortIframe from 'src/assets/short-iframe.svg';
import { initialActiveMultisigContext, useActiveMultisigContext } from 'src/context/ActiveMultisigContext';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalDAppContext } from 'src/context/DAppContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { ISharedAddressBooks } from 'src/types';
import Loader from 'src/ui-components/Loader';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import styled from 'styled-components';

import Footer from './Footer';
import Menu from './Menu';
import NavHeader from './NavHeader';
import SwitchRoutes from './SwitchRoutes';

const { Content, Sider } = Layout;

export interface IRouteInfo {
    pathName: string;
    title: string;
}

const AppLayout = ({ className }: {className?: string}) => {
	const { activeMultisig } = useGlobalUserDetailsContext();
	const { setActiveMultisigContextState } = useActiveMultisigContext();
	const { network } = useGlobalApiContext();
	const { iframeVisibility, setIframeVisibility } = useGlobalDAppContext();
	const [sideDrawer, setSideDrawer] = useState(false);
	const [multisigChanged, setMultisigChanged] = useState(false);
	const [iframeState, setIframeState] = useState(false);
	const [loading, setLoading] = useState(true);
	const location = useLocation();

	const IframeUrl= `https://sub.id/${getSubstrateAddress(activeMultisig)}`;
	const isAppsPage = window.location.pathname.split('/').pop()  === 'apps';
	const hideSlider = iframeState && isAppsPage;

	const getSharedAddressBook = useCallback(async () => {
		if(!localStorage.getItem('signature') || !localStorage.getItem('address')) return;

		setMultisigChanged(true);
		const getSharedAddressBookRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getSharedAddressBook`, {
			body: JSON.stringify({
				multisigAddress: activeMultisig
			}),
			headers: firebaseFunctionsHeader(network),
			method: 'POST'
		});

		const { data: sharedAddressBookData, error: sharedAddressBookError } = await getSharedAddressBookRes.json() as { data: ISharedAddressBooks, error: string };

		if(!sharedAddressBookError && sharedAddressBookData){
			console.log(sharedAddressBookData);
			setActiveMultisigContextState((prevState) => {
				return {
					...prevState,
					multisig: sharedAddressBookData.multisig,
					records: sharedAddressBookData.records
				};
			});
		}else {
			setActiveMultisigContextState(initialActiveMultisigContext);
		}
		setLoading(false);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMultisig, network]);

	useEffect(() => {
		getSharedAddressBook();
	}, [getSharedAddressBook]);

	useEffect(() => {
		setMultisigChanged(true);
		setTimeout(() => {
			setMultisigChanged(false);
		}, 500);
		setLoading(true);
	}, [activeMultisig]);

	useEffect(() => {
		if(isAppsPage)
			setLoading(true);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[location]);

	const handleIframeLoad = () => {
		setLoading(false);
		// Not abel to grab the elements because of same frame origin
		// const iframe = document.getElementById('Dapp') as HTMLIFrameElement;
		// const iframeDocument = iframe?.contentDocument|| iframe?.contentWindow?.document;
		// const button = iframeDocument?.getElementsByClassName('DfTopBar--rightContent')[0];
		// const search = iframeDocument?.getElementsByClassName('DfSearch')[0];
		// search?.style?.display = 'none';
		// button.style.display ='none';
	};

	return (
		<Layout className={className}>
			<NavHeader setSideDrawer={setSideDrawer} sideDrawer={sideDrawer} showSubmenu={iframeVisibility && isAppsPage} onClick={() => {
				setIframeVisibility(false);
				setIframeState(false);
				setLoading(true);
			}}/>
			<Layout hasSider style={{ transition:'ease-in-out 1s' }}>
				<div className={`bg-bg-main ${iframeVisibility && hideSlider ? 'block':'hidden'}`}>
					<section className='flex mt-[-45px] ml-8 absolute z-10 justify-start ml-5'>
						<Link className='hidden lg:block text-white' to='/'>
							<Badge
								offset={[-15, 35]}
								size='small'
								count='Beta'
								color='#1573FE'
							>
								<img
									src={polkasafeLogo}
									alt='polkasafe logo'
									className='h-[25px]'
								/>
							</Badge>
						</Link>
					</section>
					<img
						src={shortIframe}
						alt=''
						width='30'
						height='30'
						className='hidden lg:block cursor-pointer absolute top-1/2 transform left-4 -translate-y-1/2 z-20'
						onClick={() => setIframeState(false)}
					/>
				</div>
				<>
					<Sider
						trigger={null}
						collapsible={false}
						collapsed={true}
						className={`hidden overflow-y-hidden bg-bg-main sidebar lg:block top-0 bottom-0 left-0 h-screen fixed w-full max-w-[180px] z-10 ${!hideSlider ?'left-0' :'left-[-300px]'}`}
					>
						<Menu />
					</Sider>
					<Drawer
						placement='left'
						closable={false}
						onClose={() => setSideDrawer(false)}
						open={sideDrawer}
						getContainer={false}
						className='w-full max-w-[180px] p-0'
					>
						<Menu />
					</Drawer>
				</>
				<Layout className='min-h flex flex-row p-0 bg-bg-main'>
					<div className={`hidden lg:block w-full max-w-[30px] ${hideSlider ?  'relative' :'absolute'}`}></div>
					<div className={`hidden lg:block w-full max-w-[180px] ${hideSlider ? 'absolute -left-[150px]' :'relative left-0px'}`}></div>

					{iframeVisibility && isAppsPage ? (
						<div className='w-full rounded-lg'>
							{!!loading && <Loader size='large' />}
							<iframe
								id='Dapp'
								onLoad={handleIframeLoad}
								src={IframeUrl}
								className={`w-full h-[calc(100%)] ${loading ? 'hidden':'block'}`}
							></iframe>
							{ !hideSlider &&  <img
								src={longIframe}
								alt=''
								width='30'
								height='30'
								className='hidden lg:block cursor-pointer absolute top-1/2 left-auto -ml-4 transform -translate-y-1/2 z-50'
								onClick={() => setIframeState(true)}
							/>}
						</div>

					) : (
						<>
							<Content className='bg-bg-secondary p-[30px] rounded-lg'>
								{multisigChanged ? (
									<Loader size='large' />
								) : (
									<SwitchRoutes />
								)}
							</Content>
						</>
					)}
				</Layout>
			</Layout>
			<Footer />
		</Layout>
	);
};

export default styled(AppLayout)`
    background: transparent !important;
    .min-h {
        min-height: calc(100vh - 70px - 60px);
    }
    .ant-drawer-content-wrapper {
        max-width: 240px;
    }
    .ant-drawer-mask {
    }
    .ant-drawer-body {
        padding: 0;
        margin: 0;
    }
`;

