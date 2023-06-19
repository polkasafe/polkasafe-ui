import { EPAProposalType, EPASubsquidProposalType } from './types';

export default function subsquidToFirestoreProposalType(subsquidProposalType: string): string | null {
	if (!Object.values(EPASubsquidProposalType).includes((subsquidProposalType as any))) return null;

	const keyName = Object.keys(EPASubsquidProposalType)[Object.values(EPASubsquidProposalType).indexOf(subsquidProposalType as EPASubsquidProposalType)];
	return EPAProposalType[keyName as keyof typeof EPAProposalType];
}
