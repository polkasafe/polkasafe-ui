// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';
import { ReactComponent as AddressBookSVG } from 'src/assets/icons/address-book.svg';
import { ReactComponent as AppsSVG } from 'src/assets/icons/apps.svg';
import { ReactComponent as AssetsSVG } from 'src/assets/icons/assets.svg';
import { ReactComponent as DonateSVG } from 'src/assets/icons/donate.svg';
import { ReactComponent as HomeSVG } from 'src/assets/icons/home.svg';
import { ReactComponent as KeySVG } from 'src/assets/icons/key.svg';
import { ReactComponent as MenuSVG } from 'src/assets/icons/menu.svg';
import { ReactComponent as MultisigLockSVG } from 'src/assets/icons/multisig-lock.svg';
import { ReactComponent as PolkadotSVG } from 'src/assets/icons/polkadot-icon-svg.svg';
import { ReactComponent as PolkasafeLogoSVG } from 'src/assets/icons/polkasafe-logo.svg';
import { ReactComponent as PolkasafeTextSVG } from 'src/assets/icons/polkasafe-text.svg';
import { ReactComponent as SettingsSVG } from 'src/assets/icons/settings.svg';
import { ReactComponent as SubscanSVG } from 'src/assets/icons/subscan.svg';
import { ReactComponent as TransactionSVG } from 'src/assets/icons/transaction.svg';
import { ReactComponent as UserPlusSVG } from 'src/assets/icons/user-plus.svg';
import { ReactComponent as WarningSVG } from 'src/assets/icons/warning.svg';

export const AddressBookIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={AddressBookSVG} {...props} />
);

export const AppsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={AppsSVG} {...props} />
);

export const AssetsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={AssetsSVG} {...props} />
);

export const DonateIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={DonateSVG} {...props} />
);

export const HomeIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={HomeSVG} {...props} />
);

export const KeyIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={KeySVG} {...props} />
);

export const MenuIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={MenuSVG} {...props} />
);

export const SettingsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={SettingsSVG} {...props} />
);

export const TransactionIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={TransactionSVG} {...props} />
);

export const UserPlusIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={UserPlusSVG} {...props} />
);

export const WarningIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={WarningSVG} {...props} />
);

export const MultisigLockIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={MultisigLockSVG} {...props} />
);

export const PolkadotIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={PolkadotSVG} {...props} />
);

export const PolkasafeLogoIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={PolkasafeLogoSVG} {...props} />
);

export const PolkasafeTextIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={PolkasafeTextSVG} {...props} />
);

export const SubscanIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={SubscanSVG} {...props} />
);
