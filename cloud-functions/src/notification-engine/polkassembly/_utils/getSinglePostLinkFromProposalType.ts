import { EPAProposalType } from './types';

export function getSinglePostLinkFromProposalType(proposalType: EPAProposalType): string {
	switch (proposalType) {
	case EPAProposalType.BOUNTIES:
		return 'bounty';
	case EPAProposalType.CHILD_BOUNTIES:
		return 'child_bounty';
	case EPAProposalType.COUNCIL_MOTIONS:
		return 'motion';
	case EPAProposalType.DEMOCRACY_PROPOSALS:
		return 'proposal';
	case EPAProposalType.DISCUSSIONS:
		return 'post';
	case EPAProposalType.GRANTS:
		return 'grant';
	case EPAProposalType.FELLOWSHIP_REFERENDUMS:
		return 'fellowship_referendum';
	case EPAProposalType.OPEN_GOV:
		return 'referenda';
	case EPAProposalType.REFERENDUMS:
		return 'referendum';
	case EPAProposalType.TECH_COMMITTEE_PROPOSALS:
		return 'tech';
	case EPAProposalType.TIPS:
		return 'tip';
	case EPAProposalType.TREASURY_PROPOSALS:
		return 'treasury';
	case EPAProposalType.TECHNICAL_PIPS:
		return 'technical';
	case EPAProposalType.UPGRADE_PIPS:
		return 'upgrade';
	case EPAProposalType.COMMUNITY_PIPS:
		return 'community';
	}
	return '';
}
