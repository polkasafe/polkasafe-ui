// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { BN_HUNDRED } from '@polkadot/util';
import { Dropdown, Form, Input } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import React, { useEffect, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { networkTrackInfo } from 'src/global/networkTrackInfo';
import { CircleArrowDownIcon } from 'src/ui-components/CustomIcons';

const SubmitProposal = ({ className, setCallData }: { className?: string, setCallData: React.Dispatch<React.SetStateAction<string>>}) => {

	const { network, api, apiReady } = useGlobalApiContext();

	const [preimageHash, setPreimageHash] = useState<string>('');
	const [preimageLength, setPreimageLength] = useState<number>(0);
	const [track, setTrack] = useState('');

	const trackArr: string[] = [];

	if(network && networkTrackInfo){
		Object.entries(networkTrackInfo[network]).forEach(([key, value]) => {
			if(value.group === 'Treasury'){
				trackArr.push(key);
			}
		});
	}

	const trackOptions: ItemType[] = trackArr.map((item) => ({
		key: item,
		label: <span className='text-white text-sm flex items-center gap-x-2'>{item.split(/(?=[A-Z])/).join(' ')}</span>
	}));

	useEffect(() => {
		if(!api || !apiReady || !api.tx.referenda || !api.tx.referenda.submit || !preimageHash || !track || !preimageLength) {
			setCallData('');
			return;
		}

		const origin: any = { Origins: track };

		const proposal = api.tx.referenda.submit(origin ,{ Lookup: { hash: preimageHash, len: String(preimageLength) } },  { After: BN_HUNDRED });
		if(proposal) setCallData(proposal.method.toHex());

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, preimageHash, preimageLength, track]);

	return (
		<div className={className}>
			<section className={`${className}`}>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Preimage Hash*</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-full'>
						<Form.Item
							className='border-0 outline-0 my-0 p-0'
							name="preimage"
							rules={[{ message: 'Required', required: true }]}
						>
							<div className='flex items-center h-[50px]'>
								<Input
									id="preimage"
									onChange={(a) => setPreimageHash(a.target.value)}
									placeholder='Preimage Hash'
									value={preimageHash}
									className="w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20"
								/>
							</div>
						</Form.Item>
					</article>
				</div>
			</section>
			<section className='mt-[15px] w-[500px]'>
				<label className='text-primary font-normal text-xs leading-[13px] block mb-[5px]'>Preimage Length*</label>
				<div className='flex items-center gap-x-[10px]'>
					<article className='w-full'>
						<Form.Item
							className='border-0 outline-0 my-0 p-0'
							name="preimage-length"
							rules={[{ message: 'Required', required: true }]}
						>
							<div className='flex items-center h-[50px]'>
								<Input
									id="preimage-length"
									onChange={(a) => setPreimageLength(Number(a.target.value))}
									placeholder='Preimage Hash'
									value={preimageLength}
									className="w-full h-full text-sm font-normal leading-[15px] border-0 outline-0 p-3 placeholder:text-[#505050] bg-bg-secondary rounded-lg text-white pr-20"
								/>
							</div>
						</Form.Item>
					</article>
				</div>
			</section>
			<section className='mt-[15px] w-[500px]'>
				<label className='text-primary font-normal text-xs block mb-[5px]'>Select Track*</label>
				<Form.Item
					name='track'
					rules={[{ message: 'Required', required: true }]}
					className='border-0 outline-0 my-0 p-0'
				>
					<Dropdown
						trigger={['click']}
						className={'border border-primary rounded-lg p-2 bg-bg-secondary cursor-pointer'}
						menu={{
							items: trackOptions,
							onClick: (e) => setTrack(e.key)
						}}
					>
						<div className="flex justify-between items-center text-white">
							{track ? track.split(/(?=[A-Z])/).join(' ') : <span className='text-text_secondary'>Select a Track</span>}
							<CircleArrowDownIcon className='text-primary' />
						</div>
					</Dropdown>
				</Form.Item>
			</section>
		</div>
	);
};

export default SubmitProposal;