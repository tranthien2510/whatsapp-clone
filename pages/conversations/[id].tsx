import { doc, getDoc, getDocs } from "firebase/firestore"
import { GetServerSideProps } from "next"
import Head from "next/head"
import { useAuthState } from "react-firebase-hooks/auth"
import styled from "styled-components"
import ConversationScreen from "../../components/ConversationScreen"
import Sidebar from "../../components/Sidebar"
import { auth, db } from "../../config/firebase"
import { Conversation, IMessage } from "../../type"
import { generateQueryGetMessages, transformMessage } from "../../ultis/getMessagesInConversation"
import { getRecipientEmail } from "../../ultis/getRecipientEmail"

interface Props{
    conversation: Conversation
    messages: IMessage[]
}

const StyledContainer = styled.div`
    display: flex;
`

const StyledConversationContainer = styled.div`
    flex-grow: 1;
    overflow: scroll;
    height: 100vh;
    ::-webkit-scrollbar {
    display: none;
    }
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
`

const Conversation = ({conversation, messages}: Props) => {
    const [loggedInUser, _loading, _error] = useAuthState(auth);
  return (
    <StyledContainer>
        <Head>
            <title>
                Conversation with{' '} {getRecipientEmail(conversation.users, loggedInUser)}
            </title>
        </Head>  
        <Sidebar />
        <StyledConversationContainer>
            <ConversationScreen  conversation={conversation} messages={messages}/>
        </StyledConversationContainer>
    </StyledContainer>
  )
}

export default Conversation

export const getServerSideProps:GetServerSideProps<Props, {id:string}> = async context =>{
    const conversationId = context.params?.id;

    // get name who chat with me
    const conversationRef = doc(db,'conversations', conversationId as string);
    const conversationSnapshot = await getDoc(conversationRef);

      // get message between 2 people 
    const queryMessages = generateQueryGetMessages(conversationId)

    const messagesSnapshot = await getDocs(queryMessages)

    const messages = messagesSnapshot.docs.map(messageDoc => transformMessage(messageDoc))


    return {
        props:{
            conversation:conversationSnapshot.data() as Conversation, 
            messages
        }
    }
}