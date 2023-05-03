import { emailTemplateContainer } from '../../global-utils/email-template-container';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';

const template = emailTemplateContainer(NOTIFICATION_SOURCE.POLKASAFE, `
    Hi User!
    <br/><br/>
    You have a new multisig transaction to sign on <%= network %> network on Polkasafe: <a href="<%= link %>"><%= link %></a>.
`);

export default template;
