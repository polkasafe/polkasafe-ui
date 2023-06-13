// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import React, { useState } from 'react';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { OutlineCloseIcon } from 'src/ui-components/CustomIcons';

import AddCustomField from './AddCustomField';
import FieldsList from './FieldsList';

const ManageMultisig = () => {

	const { address: userAddress } = useGlobalUserDetailsContext();
	const [openAddCustomFieldModal, setOpenAddCustomFieldModal] = useState(false);

	const AddCustomFieldModal = ({ className }: { className?: string }) => {
		return (
			<>
				<Button onClick={() => setOpenAddCustomFieldModal(true)}  size='large' className={'outline-none border-none text-xs md:text-sm font-medium bg-primary text-white rounded-md md:rounded-lg flex items-center gap-x-3'}>
					<PlusCircleOutlined/>
					<span>Add Custom Field</span>
				</Button>
				<Modal
					centered
					footer={false}
					closeIcon={
						<button
							className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
							onClick={() => setOpenAddCustomFieldModal(false)}
						>
							<OutlineCloseIcon className='text-primary w-2 h-2' />
						</button>}
					title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl capitalize'>Custom Field Details</h3>}
					open={openAddCustomFieldModal}
					className={`${className} w-auto md:min-w-[500px] scale-90`}
				>
					<AddCustomField  onCancel={() => setOpenAddCustomFieldModal(false)} />
				</Modal>
			</>
		);
	};

	return (
		<div>
			{!userAddress ?
				<section className='mb-4 text-sm border-2 border-solid border-waiting w-full text-waiting bg-waiting bg-opacity-10 p-2.5 rounded-lg flex items-center gap-x-2'>
					<p className='text-white'>Looks like you are not Logged in. Please Log in to use our Features.</p>
				</section> : <>
					<div className='bg-bg-main p-5 rounded-xl relative overflow-hidden'>
						<section className='flex items-center justify-between flex-col gap-5 md:flex-row mb-6'>
							<div className='flex-1'></div>
							<AddCustomFieldModal/>
						</section>
						<section>
							<FieldsList />
						</section>
					</div>
				</>}
		</div>
	);
};

export default ManageMultisig;