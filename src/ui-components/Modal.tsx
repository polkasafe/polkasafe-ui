// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal as AntDModal } from 'antd';
import React, { FC, PropsWithChildren, ReactNode } from 'react';

import { OutlineCloseIcon } from './CustomIcons';

export interface IModal extends PropsWithChildren {
    isVisible: boolean;
    title: ReactNode;
    CloseBtnNode?: ReactNode;
	switch?: Boolean;
}

interface IModalProps extends IModal {
    toggleVisibility: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Modal: FC<IModalProps> = ({ isVisible, children, CloseBtnNode, title, toggleVisibility }) => {
	return (
		<AntDModal
			// width={1000}
			centered
			footer={false}
			closeIcon={<button
				className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
				onClick={() => toggleVisibility()}
			>
				<OutlineCloseIcon className='text-primary w-2 h-2' />
			</button>}
			title={<h3 className='text-white mb-8 text-lg font-semibold'>{title}</h3>}
			open={isVisible}
			className='w-auto md:min-w-[500px]'
		>
			{children}
		</AntDModal>
	);
};

export default Modal;