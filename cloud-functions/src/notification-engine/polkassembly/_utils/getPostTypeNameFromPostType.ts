import { EPAProposalType } from './types';

export default function getPostTypeNameFromPostType(proposalType: EPAProposalType) {
	const postTypeNameMap: { [key in EPAProposalType]: string } = {
		[EPAProposalType.DEMOCRACY_PROPOSALS]: 'democracy proposal',
		[EPAProposalType.TECH_COMMITTEE_PROPOSALS]: 'tech. committee proposal',
		[EPAProposalType.TREASURY_PROPOSALS]: 'treasury proposal',
		[EPAProposalType.REFERENDUMS]: 'referendum',
		[EPAProposalType.FELLOWSHIP_REFERENDUMS]: 'fellowship referendum',
		[EPAProposalType.COUNCIL_MOTIONS]: 'council motion',
		[EPAProposalType.BOUNTIES]: 'bounty',
		[EPAProposalType.TIPS]: 'tip',
		[EPAProposalType.CHILD_BOUNTIES]: 'child bounty',
		[EPAProposalType.OPEN_GOV]: 'open gov referendum',
		[EPAProposalType.DISCUSSIONS]: 'discussion',
		[EPAProposalType.GRANTS]: 'grant',
		[EPAProposalType.COMMUNITY_PIPS]: 'community PIP',
		[EPAProposalType.UPGRADE_PIPS]: 'Upgrade Committee PIP',
		[EPAProposalType.TECHNICAL_PIPS]: 'Technical Committee PIP'
	};

	return postTypeNameMap[proposalType] || proposalType;
}
