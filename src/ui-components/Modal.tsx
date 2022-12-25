// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { FC, PropsWithChildren, ReactNode } from 'react';

import { OutlineCloseIcon } from './CustomIcons';

export interface IModal extends PropsWithChildren {
    isVisible: boolean;
    title: ReactNode;
    CloseBtnNode?: ReactNode;
}

interface IModalProps extends IModal {
    toggleVisibility: () => void;
}

const Modal: FC<IModalProps> = ({ isVisible, children, CloseBtnNode, title, toggleVisibility }) => {
	return (
		<section className={classNames('absolute inset-0 h-screen w-screen bg-black bg-opacity-50 text-white flex items-center justify-center p-5 z-50', {
			'hidden opacity-0 h-0 w-0': !isVisible
		})}>
			<div className='bg-bg-main rounded-xl p-5 md:p-[30px] md:min-w-[500px]'>
				<article className='flex items-center justify-between gap-x-5'>
					<h3 className='text-white text-lg font-semibold md:font-bold md:text-xl'>{title}</h3>
					{!CloseBtnNode?
						<button
							className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
							onClick={() => toggleVisibility()}
						>
							<OutlineCloseIcon className='text-primary w-2 h-2' />
						</button>
						: CloseBtnNode}
				</article>
				<article className='mt-8'>
					{children}
				</article>
			</div>
		</section>
	);
};

export default Modal;