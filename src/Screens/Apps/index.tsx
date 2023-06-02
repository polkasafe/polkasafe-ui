// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classNames from 'classnames';
import React, { useState } from 'react';
import AllApps from 'src/components/Apps/index';
import { ExternalLinkIcon } from 'src/ui-components/CustomIcons';
enum ETab {
	ALL_APPS,
	BOOKMARK_APPS
}
const Apps = () => {
	const [tab, setTab] = useState(ETab.ALL_APPS);
	return (
		<div className='scale-[80%] h-[125%] w-[125%] origin-top-left'>
			<div
				className='flex items-center mb-5'
			>
				<button
					onClick={() => setTab(ETab.ALL_APPS)}
					className={classNames(
						'rounded-lg p-3 text-sm leading-[15px] w-[110px] text-white',
						{
							'text-primary bg-highlight': tab === ETab.ALL_APPS
						}
					)}
				>
					{/* <QueueIcon /> */}
						All Apps
				</button>
				<button
					onClick={() => setTab(ETab.BOOKMARK_APPS)}
					className={classNames(
						'rounded-lg p-3 text-sm leading-[15px] w-[150px] text-white',
						{
							'text-primary bg-highlight': tab === ETab.BOOKMARK_APPS
						}
					)}
				>
					{/* <HistoryIcon/> */}
						Bookmarked Apps
				</button>
				<div className='ml-auto flex text-sm text-waiting font-medium'>
				Want to create an interesting app? <div className='text-primary'>Contact Us
						<a target='_blank' rel="noreferrer" >
							<ExternalLinkIcon  />
						</a>
					</div>
				</div>

			</div>
			{
				tab === ETab.ALL_APPS ?
					<AllApps/>
					:
					<div className='text-white text-2xl flex justify-center items-center h-screen'>
						Coming soon
					</div>
			}
		</div>
	);
};

export default Apps;
