import { collection, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../config/firebase";
import { AppUser, Conversation } from "../type";
import { getRecipientEmail } from "../ultis/getRecipientEmail";

export const useRecipient = (conversationUsers: Conversation['users']) =>{
    const[loggedInUser, _loading, _error] = useAuthState(auth);

    // get recipient Email
    const recipientEmail = getRecipientEmail(conversationUsers, loggedInUser);

    // get recipient Avatar

    const queryGetRicipent = query(collection(db, 'users'), where('email', '==', recipientEmail))
    const [recipientsSnapshot, __loading,__error] = useCollection(queryGetRicipent);

    const recipient = recipientsSnapshot?.docs[0]?.data() as AppUser | undefined; 

    return {recipient, recipientEmail}
}