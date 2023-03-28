// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal } from 'antd';
import React from 'react';
import FailedTransactionLottie from 'src/assets/lottie-graphics/FailedTransaction';
import LoadingLottie from 'src/assets/lottie-graphics/Loading';
import SuccessTransactionLottie from 'src/assets/lottie-graphics/SuccessTransaction';

import { OutlineCloseIcon } from './CustomIcons';

interface ILoadingModal{
    loading: boolean
    success?: boolean
    failed?: boolean
    open: boolean
    onCancel: () => void
}

const LoadingModal = ({ loading, success, open, onCancel }: ILoadingModal) => {
	return (
		<Modal
			centered
			footer={false}
			closeIcon={
				<button
					className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
					onClick={() => onCancel()}
				>
					<OutlineCloseIcon className='text-primary w-2 h-2' />
				</button>}
			open={open}
			className={'w-auto text-primary md:min-w-[500px]'}
		>
			{loading ? <LoadingLottie message='Loading...' /> : success ? <SuccessTransactionLottie message='Successful!'/> : <FailedTransactionLottie message='Failed!' />}
		</Modal>
	);
};

export default LoadingModal;