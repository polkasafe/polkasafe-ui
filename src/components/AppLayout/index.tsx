// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Drawer, Layout } from 'antd';
import { Badge } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import polkasafeLogo from 'src/assets/icons/polkasafe.svg';
import longiframe from 'src/assets/longiframe.svg';
import shortiframe from 'src/assets/shortiframe.svg';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import Loader from 'src/ui-components/Loader';
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

const AppLayout = ({ className }: { className?: string }) => {
	const [sideDrawer, setSideDrawer] = useState(false);
	const [multisigChanged, setMultisigChanged] = useState(false);
	const { activeMultisig } = useGlobalUserDetailsContext();
	const { iframeVisibility } = useGlobalApiContext();
	const [IframeUrl, setIframeUrl] = useState('');
	const [iframestate, setiframestate] = useState(false);
	useEffect(() => {
		setMultisigChanged(true);
		setTimeout(() => {
			setMultisigChanged(false);
		}, 500);
		setIframeUrl(`https://sub.id/${activeMultisig}`);
	}, [activeMultisig]);

	return (
		<Layout className={className}>
			<NavHeader setSideDrawer={setSideDrawer} sideDrawer={sideDrawer} />
			<Layout hasSider>
				{

					iframeVisibility && iframestate ? <div className='w-full bg-bg-main'><section className='flex -mt-12 absolute z-10 justify-start ml-5 w-full'>
						<Link className='text-white' to='/'>
							<Badge offset={[-15, 35]} size='small' count='Beta' color='#1573FE'>
								<img src={polkasafeLogo} alt="polkasafe logo" className='h-[25px]' />
							</Badge>
						</Link>
					</section><img src={shortiframe} alt="" width="30" height="30" className='cursor-pointer absolute top-1/2 transform left-4 -translate-y-1/2 z-10 ' onClick={() => setiframestate(false)} /><iframe src={IframeUrl} className='w-full relative h-[calc(100%)] ml-8' >
					</iframe></div> : <>
						<Sider
							trigger={null}
							collapsible={false}
							collapsed={true}
							className={'hidden overflow-y-hidden bg-bg-main sidebar lg:block top-0 bottom-0 left-0 h-screen fixed w-full max-w-[180px]'}
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
				}
				<Layout className='min-h flex flex-row p-0 bg-bg-main '>
					<div className='hidden lg:block w-full max-w-[180px]'></div>
					{
						iframeVisibility && IframeUrl && !iframestate && window.location.pathname.split('/').pop() == 'apps' ? <div className='w-full '><iframe src={IframeUrl} className='w-full h-[calc(100%)]' ></iframe><img src={longiframe} alt="" width="30" height="30" className='cursor-pointer absolute top-1/2 left-auto -ml-4 transform -translate-y-1/2 z-9999' onClick={() => setiframestate(true)} /></div> : <><Content className='bg-bg-secondary p-[30px] rounded-lg'>
							{multisigChanged ? <Loader size='large' /> : <SwitchRoutes />}
						</Content></>
					}
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
