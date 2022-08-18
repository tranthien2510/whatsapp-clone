import { IconButton } from "@mui/material";
import styled from "styled-components";
import { useRecipient } from "../hooks/useRecipients";
import { Conversation, IMessage } from "../type";
import { convertFirestoreTimestampToString, generateQueryGetMessages, transformMessage } from "../ultis/getMessagesInConversation";
import RecipientAvatar from "./RecipientAvatar";
import AttachFileIcon from '@mui/icons-material/AttachFile'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../config/firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import Message from "./Message";
import  InsertEmotIcon  from "@mui/icons-material/InsertEmoticon";
import  SendIcon  from "@mui/icons-material/Send";
import  MicIcon  from "@mui/icons-material/Mic";
import { KeyboardEventHandler, MouseEventHandler, useRef, useState } from "react";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

const StyledRecipientHeader = styled.div`
    position: sticky;
    background-color: #fff;
    z-index: 100;
    top: 0;
    display: flex;
    align-items: center;
    padding: 11px;
    height: 80px;
    border-bottom: 1px solid whitesmoke;
`
const StyledHeaderInfo = styled.div`
    margin-left: 15px;
    flex-grow: 1;
    > h3 {
        margin-top: 0;
        margin-bottom: 3px;
    }
    > span{
        font-size: 14px;
        color: gray;
    }
`

const StyledH3 = styled.h3`
    word-break: break-all;
`
const StyledHeaderIcons = styled.div`
    display: flex;
`

const StyledMessagesContainer = styled.div`
    padding: 30px;
    background-color: #e5ded8;
    min-height: 90vh;
`
const StyledInputContainer = styled.form`
    display: flex;
    align-items: center;
    padding: 10px;
    position: sticky;
    bottom: 0;
    background-color: #fff;
    z-index: 100;
`
const StyledInput = styled.input`
    flex-grow: 1;
    outline: none;
    border: none;
    border-radius: 10px;
    background-color: whitesmoke;
    padding: 15px;
    margin-left: 15px;
    margin-right: 15px;
    color: #444;
`

const EndOfMessagesForAutoScroll = styled.div`
    margin-bottom: 30px;
`
const ConversationScreen = ({conversation, messages} : {conversation:Conversation, messages: IMessage}) => {
    const [newMessage, setNewMessage] = useState('')
    const [loggedInUser, _loading,_error] = useAuthState(auth)
    const conversationUsers = conversation.users;

    const {recipientEmail,recipient} = useRecipient(conversationUsers)

    const router = useRouter();
    const conversationId = router.query.id;

    const queryGetMessages =   generateQueryGetMessages(conversationId as string)

    const [messagesSnapshot, messagesLoading, __error] = useCollection(queryGetMessages)

    const showMessages = ()=>{
        if (messagesLoading) {
            return messages.map((message) => (
                <Message key={message.id} message={message} />
            ));
        }
        if (messagesSnapshot) {
            return messagesSnapshot.docs.map((message) =>(
                <Message key={message.id} message={transformMessage(message)} />  
            ))
        }

        return null;
    }
    const addMessageToDbAndUpdateLastSeen = async () =>{
        await setDoc(doc(db, 'users', loggedInUser?.email as srting), {
            lastSeen:serverTimestamp()
        },{merge:true}) // update những cái đó đã thay đổi

        // thêm tin nhắn mới vào 'messages' collection

        await addDoc(collection(db, 'messages'),{
            conversation_id: conversationId,
            sent_at:serverTimestamp(),
            text:newMessage,
            user: loggedInUser?.email
        })

        //reset input field
        setNewMessage('')
        //scroll to bottom
        scrollToBottom();
    }
    const sendMessageOnEnter:KeyboardEventHandler<HTMLInputElement> = e =>{
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!newMessage) return
            addMessageToDbAndUpdateLastSeen()   
        }
    }
    const sendMessageOnClick: MouseEventHandler<HTMLButtonElement> = e =>{
        e.preventDefault()
        if (!newMessage) {
            return
        }
        addMessageToDbAndUpdateLastSeen()
    }
    const endOfMessagesRef = useRef<HTMLDivElement>(null)
    const scrollToBottom = ()=>{
        endOfMessagesRef.current?.scrollIntoView({behavior:"smooth"})
    }
  return (
   <>
    <StyledRecipientHeader>
        <RecipientAvatar recipient={recipient} recipientEmail={recipientEmail}/>
        <StyledHeaderInfo>
            <StyledH3>
                {recipientEmail}
            </StyledH3>
            {recipient && <span>last active: {convertFirestoreTimestampToString(recipient.lastSeen)}</span>}
        </StyledHeaderInfo>

        <StyledHeaderIcons>
            <IconButton>
                <AttachFileIcon/>
            </IconButton>
            <IconButton>
                <MoreVertIcon />
            </IconButton>
        </StyledHeaderIcons>
    </StyledRecipientHeader>
    <StyledMessagesContainer>
        {showMessages()}
        <EndOfMessagesForAutoScroll ref={endOfMessagesRef}/>
    </StyledMessagesContainer>
    <StyledInputContainer>
        <InsertEmotIcon />
        <StyledInput value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={sendMessageOnEnter} />
        <IconButton onClick={sendMessageOnClick} disabled={!newMessage}>
            <SendIcon />
        </IconButton>
        <IconButton>
            <MicIcon />
        </IconButton>
    </StyledInputContainer>
   </>
  )
}

export default ConversationScreen