// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DownloadOutlined, PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import AddAddressForm from 'src/components/AddressBook/AddAddressForm';
import AddressTable from 'src/components/AddressBook/AddressTable';

const index = () => {
	const [isShown, setIsShown] = useState(false);
	function handleClick(): any {
		setIsShown(current => !current);
	}
	return (
		<div>
			<div className="grid grid-cols-12 gap-4">
				<div className="col-start-1 col-end-13">
					<div className="flex items-center justify-between">
						<div className='flex items-center'>
							<h2 className="text-lg font-bold">Address Book</h2>
							<p>(4)</p>
						</div>
						<div className='flex'>
							<div className='flex mr-2'>
								<UploadOutlined className='text-blue_primary font-bold' />
								<p className='px-2 cursor-pointer font-bold hover:text-blue_secondary text-blue_primary'>Export</p>
							</div>
							<div className='flex mr-2'>
								<DownloadOutlined className='text-blue_primary font-bold' />
								<p className='px-2 cursor-pointer font-bold hover:text-blue_secondary text-blue_primary'>Import</p>
							</div>
							<div className='flex mr-2'>
								<PlusCircleOutlined className='text-blue_primary font-bold' />
								<p className='px-2 cursor-pointer font-bold hover:text-blue_secondary text-blue_primary' onClick={handleClick}>Create new Entry</p>
							</div>
						</div>
					</div>
				</div>
				<div className='col-start-1 col-end-13 relative'>
					<AddressTable />
					{isShown && (
						<AddAddressForm />
					)}
				</div>
			</div>
		</div>
	);
};

export default index;