// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';
import { ReactComponent as AddSVG } from 'src/assets/icons/add.svg';
import { ReactComponent as AddBoxSVG } from 'src/assets/icons/add-box.svg';
import { ReactComponent as AddressBookSVG } from 'src/assets/icons/address-book.svg';
import { ReactComponent as AppsSVG } from 'src/assets/icons/apps.svg';
import { ReactComponent as ArrowDownLeftSVG } from 'src/assets/icons/arrow-down-left.svg';
import { ReactComponent as AssetsSVG } from 'src/assets/icons/assets.svg';
import { ReactComponent as BrainSVG } from 'src/assets/icons/brain-icon.svg';
import { ReactComponent as ChainSVG } from 'src/assets/icons/chain-icon.svg';
import { ReactComponent as CircleArrowDownSVG } from 'src/assets/icons/circle-arrow-down.svg';
import { ReactComponent as CloseSVG } from 'src/assets/icons/close-icon.svg';
import { ReactComponent as CopySVG } from 'src/assets/icons/copy.svg';
import { ReactComponent as CopyGreySVG } from 'src/assets/icons/copy-icon-grey.svg';
import { ReactComponent as CreateMultisigSVG } from 'src/assets/icons/createMultisig.svg';
import { ReactComponent as DashDotSVG } from 'src/assets/icons/dash-dot.svg';
import { ReactComponent as DeleteSVG } from 'src/assets/icons/delete.svg';
import { ReactComponent as DollarSVG } from 'src/assets/icons/dollar.svg';
import { ReactComponent as DonateSVG } from 'src/assets/icons/donate.svg';
import { ReactComponent as EditSVG } from 'src/assets/icons/edit.svg';
import { ReactComponent as ExportArrowSVG } from 'src/assets/icons/export-arrow.svg';
import { ReactComponent as ExternalLinkSVG } from 'src/assets/icons/external-link.svg';
import { ReactComponent as HomeSVG } from 'src/assets/icons/home.svg';
import { ReactComponent as ImportArrowSVG } from 'src/assets/icons/import-arrow.svg';
import { ReactComponent as KeySVG } from 'src/assets/icons/key.svg';
import { ReactComponent as LinkSVG } from 'src/assets/icons/link.svg';
import { ReactComponent as MenuSVG } from 'src/assets/icons/menu.svg';
import { ReactComponent as MultisigLockSVG } from 'src/assets/icons/multisig-lock.svg';
import { ReactComponent as NoNotificationSVG } from 'src/assets/icons/no-notification.svg';
import { ReactComponent as NoQueuedTransactionSVG } from 'src/assets/icons/no-queued-transaction.svg';
import { ReactComponent as NoTransactionSVG } from 'src/assets/icons/no-transaction.svg';
import { ReactComponent as NotificationSVG } from 'src/assets/icons/notification.svg';
import { ReactComponent as OutlineCheckSVG } from 'src/assets/icons/outline-check.svg';
import { ReactComponent as OutlineCloseSVG } from 'src/assets/icons/outline-close.svg';
import { ReactComponent as PencilSVG } from 'src/assets/icons/pencil.svg';
import { ReactComponent as PencilNotificationSVG } from 'src/assets/icons/pencil-notification.svg';
import { ReactComponent as PolkadotLogoTextSVG } from 'src/assets/icons/polkadot-logo-text.svg';
import { ReactComponent as PolkasafeSVG } from 'src/assets/icons/polkasafe.svg';
import { ReactComponent as PolkasafeLogoSVG } from 'src/assets/icons/polkasafe-logo.svg';
import { ReactComponent as PolkasafeTextSVG } from 'src/assets/icons/polkasafe-text.svg';
import { ReactComponent as PSSVG } from 'src/assets/icons/ps-icon.svg';
import { ReactComponent as QRSVG } from 'src/assets/icons/qr.svg';
import { ReactComponent as SearchSVG } from 'src/assets/icons/search.svg';
import { ReactComponent as SettingsSVG } from 'src/assets/icons/settings.svg';
import { ReactComponent as ShareSVG } from 'src/assets/icons/share-icon.svg';
import { ReactComponent as SubscanSVG } from 'src/assets/icons/subscan.svg';
import { ReactComponent as TransactionSVG } from 'src/assets/icons/transaction.svg';
import { ReactComponent as TrashSVG } from 'src/assets/icons/trash.svg';
import { ReactComponent as UploadBoxSVG } from 'src/assets/icons/upload-box.svg';
import { ReactComponent as UserPlusSVG } from 'src/assets/icons/user-plus.svg';
import { ReactComponent as WalletSVG } from 'src/assets/icons/wallet-icon.svg';
import { ReactComponent as WarningSVG } from 'src/assets/icons/warning.svg';
import { ReactComponent as WarningRoundedSVG } from 'src/assets/icons/warning-rounded.svg';
import { ReactComponent as KusamaSVG } from 'src/assets/parachains-icons/kusama.svg';
import { ReactComponent as PolkadotSVG } from 'src/assets/parachains-icons/polkadot.svg';

export const AddIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={AddSVG} {...props} />
);

export const AddressBookIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={AddressBookSVG} {...props} />
);

export const AppsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={AppsSVG} {...props} />
);

export const AssetsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={AssetsSVG} {...props} />
);

export const ArrowDownLeftIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={ArrowDownLeftSVG} {...props} />
);

export const CircleArrowDownIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={CircleArrowDownSVG} {...props} />
);

export const CopyIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={CopySVG} {...props} />
);

export const DeleteIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={DeleteSVG} {...props} />
);

export const DollarIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={DollarSVG} {...props} />
);

export const DonateIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={DonateSVG} {...props} />
);

export const EditIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={EditSVG} {...props} />
);

export const ExternalLinkIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={ExternalLinkSVG} {...props} />
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

export const NoTransactionIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={NoTransactionSVG} {...props} />
);

export const NoQueuedTransactionIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={NoQueuedTransactionSVG} {...props} />
);

export const NotificationIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={NotificationSVG} {...props} />
);

export const NoNotificationIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={NoNotificationSVG} {...props} />
);

export const OutlineCheckIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={OutlineCheckSVG} {...props} />
);

export const OutlineCloseIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={OutlineCloseSVG} {...props} />
);

export const PencilNotificationIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={PencilNotificationSVG} {...props} />
);

export const PencilIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={PencilSVG} {...props} />
);

export const SearchIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={SearchSVG} {...props} />
);

export const SettingsIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={SettingsSVG} {...props} />
);

export const TransactionIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={TransactionSVG} {...props} />
);

export const TrashIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={TrashSVG} {...props} />
);

export const UserPlusIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={UserPlusSVG} {...props} />
);

export const WarningIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={WarningSVG} {...props} />
);

export const WarningRoundedIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={WarningRoundedSVG} {...props} />
);

export const WalletIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={WalletSVG} {...props} />
);

export const MultisigLockIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={MultisigLockSVG} {...props} />
);

export const PolkadotLogoTextIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={PolkadotLogoTextSVG} {...props} />
);

export const PolkasafeIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={PolkasafeSVG} {...props} />
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

export const QRIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={QRSVG} {...props} />
);
export const PSIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={PSSVG} {...props} />
);
export const ChainIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={ChainSVG} {...props} />
);
export const BrainIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={BrainSVG} {...props} />
);

// PARACHAINS ICONS

export const KusamaIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={KusamaSVG} {...props} />
);

export const PolkadotIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={PolkadotSVG} {...props} />
);
export const CloseIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={CloseSVG} {...props} />
);
export const ImportArrowIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={ImportArrowSVG} {...props} />
);
export const ExportArrowIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={ExportArrowSVG} {...props} />
);
export const ShareIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={ShareSVG} {...props} />
);
export const CopyGreyIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={CopyGreySVG} {...props} />
);
export const UploadBoxIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={UploadBoxSVG} {...props} />
);
export const AddBoxIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={AddBoxSVG} {...props} />
);
export const DashDotIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={DashDotSVG} {...props} />
);
export const CreateMultisigIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={CreateMultisigSVG} {...props} />
);
export const LinkIcon = (props: Partial<CustomIconComponentProps>) => (
	<Icon component={LinkSVG} {...props} />
);
