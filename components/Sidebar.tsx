import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { useState } from 'react'
import styled from 'styled-components'
import ChatIcon from '@mui/icons-material/Chat'
import MoreVerticalIcon from '@mui/icons-material/MoreVert'
import LogoutIcon from '@mui/icons-material/Logout'
import SearchIcon from '@mui/icons-material/Search'
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import { useAuthState } from 'react-firebase-hooks/auth';
import * as EmailValidator from "email-validator";
import { addDoc, collection, query, where } from 'firebase/firestore';
import {useCollection} from 'react-firebase-hooks/firestore'
import { Conversation } from '../type';
import ConversationSelect from './ConversationSelect';

const StyledContainer = styled.div`
    height: 100vh;
    min-width: 300px;
    max-width: 350px;
    border-right: 1px solid #eee;
    overflow-y: scroll;
     ::-webkit-scrollbar {
    display: none;
    }
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
`;
const StyledHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80px;
    padding: 15px;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    background-color: #fff;
    z-index: 1;
`;
const StyledSearch = styled.div`
    display: flex;
    align-items: center;
    padding: 15px;
    border-radius: 2px;
`;


const StyledSidebarButton = styled(Button)`
    width: 100%;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
`;
const StyledUserAvatar = styled(Avatar)`
    cursor: pointer;
    :hover{
        opacity: 0.8;
    }
`;

const StyledSearchInput = styled.input`
    outline: none;
    border: none;
    flex: 1;
    background-color: #fff;
    color:#333;
`;

const Sidebar = () => {
    const [loggedInUser, _loading, _error] = useAuthState(auth);
    const [isOpenNewConversationDialog,setisOpenNewConversationDialog]  =useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const toggleNewConversationDialog = (isOpen: boolean) =>{
        setisOpenNewConversationDialog(isOpen);
        if (!isOpen) setRecipientEmail('');
    }
    const isInvitingSelf = recipientEmail === loggedInUser?.email;
    //lấy ra danh sách người dùng đang được mời nói chuyện
    const queryGetConversationsForCurrentUser = query(collection(db, 'conversations'),where('users','array-contains', loggedInUser?.email))
    const [conversationsSnapshot, __loading, __error] = useCollection(queryGetConversationsForCurrentUser);
    // kiểm tra người dùng đã được mời hay chưa 
    const isConversationAlreadyExits = (recipientEmail: string) =>{
        return conversationsSnapshot?.docs.find(conversation => (conversation.data() as Conversation).users.includes(recipientEmail))

    };
    const logout = async ()=>{
        try {
            await signOut(auth)
        } catch (error) {
            console.log("ERROR LOGGIN OUT", error)
        }
    }

    const createConversation = async()=>{
        if(!recipientEmail) return

        // check có phải email hay ko và có phải mời chính mình hay ko và người dùng đã được mời hay chưa
        if ( EmailValidator.validate(recipientEmail) && !isInvitingSelf && !isConversationAlreadyExits(recipientEmail)) {
            //Add conversation  user to db "conversations" collection
            await addDoc(collection(db, 'conversations'), {
                users:[loggedInUser?.email, recipientEmail]
            })
            
        }

        toggleNewConversationDialog(false);
    }
  return (
    <StyledContainer>
        <StyledHeader>
            <Tooltip title={loggedInUser?.email as string} placement='right'>
                <StyledUserAvatar src={loggedInUser?.photoURL || ''} />
            </Tooltip>
            <div>
                <IconButton>
                    <ChatIcon />
                </IconButton>
                <IconButton>
                    <MoreVerticalIcon />
                </IconButton>
                <IconButton onClick={logout}>
                    <LogoutIcon />
                </IconButton>
            </div>
        </StyledHeader>
        <StyledSearch>
            <SearchIcon />
            <StyledSearchInput placeholder="Search in conversations"/>
        </StyledSearch>
        <StyledSidebarButton onClick={()=>toggleNewConversationDialog(true)}>
            Start new a conversation
        </StyledSidebarButton>

        {
        conversationsSnapshot?.docs.map(conver => 
            <ConversationSelect  key={conver.id} id={conver.id} conversationUsers={(conver.data() as Conversation).users}/>)
        }


        <Dialog open={isOpenNewConversationDialog} onClose={()=>toggleNewConversationDialog(false)}>
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter  a Google email address for the user you wish to chat with
          </DialogContentText>
          <TextField
            autoFocus
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={recipientEmail}
            onChange={e=>setRecipientEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>toggleNewConversationDialog(false)}>Cancel</Button>
          <Button disabled={!recipientEmail} onClick={createConversation}>Create</Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  )
}

export default Sidebar