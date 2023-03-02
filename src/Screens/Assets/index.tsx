// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback, useEffect, useState } from 'react';
import AssetsTable from 'src/components/Assets/AssetsTable';
import DropDown from 'src/components/Assets/DropDown';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IAsset } from 'src/types';
import getNetwork from 'src/utils/getNetwork';

const network = getNetwork();

const Assets = () => {

	const [loading, setLoading] = useState<boolean>(false);
	const [assetsData, setAssetsData] = useState<IAsset[]>([]);

	const handleGetAssets = useCallback(async () => {
		try{
			const address = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!address || !signature) {
				console.log('ERROR');
				return;
			}
			else{

				setLoading(true);
				const getAssestsRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getAssetsForAddress`, {
					body: JSON.stringify({
						address,
						network
					}),
					headers: firebaseFunctionsHeader(),
					method: 'POST'
				});

				const { data, error } = await getAssestsRes.json() as { data: IAsset[], error: string };

				if(error) {
					setLoading(false);
					return;
				}

				if(data){
					setAssetsData(data);
					console.log('data:', data);
					setLoading(false);

				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		handleGetAssets();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if(loading){
		return (
			<div className='h-[70vh] bg-bg-main rounded-lg flex justify-center items-center'>
				<h2 className='font-bold text-xl leading-[22px] text-primary'>
					Loading...
				</h2>
			</div>
		);
	}

	return (
		<div className='h-[70vh] bg-bg-main rounded-lg'>
			<div className="grid grid-cols-12 gap-4">
				<div className="col-start-1 col-end-13">
					<div className="flex items-center justify-between">
						<div className='flex items-center'>
							<h2 className="text-lg font-bold text-white mt-3 ml-5">Tokens</h2>
						</div>
						<div className='flex items-center justify-center mr-5 mt-3'>
							<p className='text-text_secondary mx-2'>Currency:</p>
							<DropDown />
						</div>
					</div>
				</div>
				<div className='col-start-1 col-end-13 mx-5'>
					<AssetsTable assets={ assetsData }/>
				</div>
			</div>
		</div>
	);
};

export default Assets;