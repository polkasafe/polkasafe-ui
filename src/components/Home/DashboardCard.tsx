// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import React from 'react';
import PrimaryButton from 'src/ui-components/PrimaryButton';

const DashboardCard = ({ className } : { className?: string}) => {
	return (
		<div className={`${className} rounded-lg px-8 py-5 bg-white shadow-lg`}>
			<div className="flex justify-between">
				<div className='flex gap-x-4 items-center'>
					<Avatar className='border-8 border-secondary' size={74} icon={<UserOutlined />} />
					<div>
						{/* TODO: Use dynamic values */}
						<div className='text-xl font-bold'>John Doe</div>
						<div className='text-xl font-normal'>3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy</div>
					</div>
				</div>

				<div className='text-right'>
					<PrimaryButton onClick={() => {}}>&#43; New Transaction</PrimaryButton>
					{/* TODO: use getNetworkName() */}
					<div className='mt-3 text-[#A3A2FF] text-lg font-normal'>Polkadot</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardCard;