import styled from "styled-components"
import Image from 'next/image'
import WhatsAppLogo from '../assets/whatsapplogo.png'
import CircularProgress from "@mui/material/CircularProgress"


const StyledcContainer = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   flex-direction: column;
    height: 100vh;
`
const StyledImageWrapper = styled.div`
    margin-bottom: 50px;
`

function Loading() {
  return (
    <StyledcContainer>
        <StyledImageWrapper>
            <Image src={WhatsAppLogo} alt="WhatsApp logo" height='200px' width='200px'/>
        </StyledImageWrapper>

        <CircularProgress />
    </StyledcContainer>
  )
}

export default Loading