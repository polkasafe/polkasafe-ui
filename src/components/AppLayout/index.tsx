// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Drawer, Layout } from 'antd';
import React, { useState } from 'react';
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
	const [selectedRoute, setSelectedRoute] = useState<IRouteInfo>({
		pathName: '/',
		title: 'Home'
	});

	return (
		<Layout className={className}>
			<NavHeader selectedRoute={selectedRoute} setSideDrawer={setSideDrawer} sideDrawer={sideDrawer} />
			<Layout hasSider>
				<Sider
					trigger={null}
					collapsible={false}
					collapsed={true}
					className={'hidden overflow-y-hidden bg-bg-main sidebar lg:block top-0 bottom-0 left-0 h-screen fixed z-40 w-full max-w-[240px]'}
				>
					<Menu selectedRoute={selectedRoute} setSelectedRoute={setSelectedRoute} />
				</Sider>
				<Drawer
					placement='left'
					closable={false}
					onClose={() => setSideDrawer(false)}
					open={sideDrawer}
					getContainer={false}
					className='w-full max-w-[240px] p-0'
				>
					<Menu selectedRoute={selectedRoute} setSelectedRoute={setSelectedRoute} />
				</Drawer>
				<Layout className='min-h flex flex-row p-0 bg-bg-main'>
					<div className='hidden lg:block w-full max-w-[240px]'></div>
					<Content className='bg-bg-secondary p-8 rounded-lg'>
						<SwitchRoutes />
					</Content>
				</Layout>
			</Layout>
			<Footer />
		</Layout>
	);
};

export default styled(AppLayout)`
	background: transparent !important;
	.min-h {
		min-height: calc(100vh - 90px - 80px);
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