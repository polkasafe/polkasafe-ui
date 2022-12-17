// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React, { FC, PropsWithChildren } from 'react';

interface IContentWrapper extends PropsWithChildren {
    className?: string;
}

const ContentWrapper: FC<IContentWrapper> = ({ children, className }) => {
	return (
		<section
			className={classNames('bg-white shadow-large p-4 lg:p-8 rounded-lg mt-2.5', className)}
		>
			{children}
		</section>
	);
};

export default ContentWrapper;