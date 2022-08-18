import { useRouter } from "next/router";
import styled from "styled-components";
import { useRecipient } from "../hooks/useRecipients";
import { Conversation } from "../type";
import RecipientAvatar from "./RecipientAvatar";

const ConversationSelect = ({id, conversationUsers}: {id:string; conversationUsers: Conversation['users']}) => {
const StyledContainer = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 15px;
    gap:10px;
    word-break: break-all;
    :hover{
        background-color: #e9eaeb;
    }
`;
  const {recipient,recipientEmail} = useRecipient(conversationUsers);

  const router = useRouter();
  const onSelectConversation = ()=>{
    router.push(`/conversations/${id}`)
  }

  return (
    <StyledContainer onClick={onSelectConversation}>
          <RecipientAvatar recipient={recipient} recipientEmail={recipientEmail}/>
          {recipientEmail}
    </StyledContainer>
  )
}

export default ConversationSelect