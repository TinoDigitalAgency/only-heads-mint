import styled from 'styled-components';
import {useEffect, useState} from 'react';
import Button from '@material-ui/core/Button';
import {CircularProgress} from '@material-ui/core';
import {GatewayStatus, useGateway} from '@civic/solana-gateway-react';
import {CandyMachineAccount} from './candy-machine';


export const CTAButton = styled(Button)`
  display: block !important;
  margin: 0 auto !important;
  background-color: #F7BE42 !important;
  min-width: 211px !important;
  font-size: 18px !important;
  font-wight: 600 !important;
  line-height: 24px !important;
  border-radius: 60px !important;
  padding: 20px !important;
`;

export const MintButton = ({
                               onMint,
                               candyMachine,
                               isMinting,
                               isEnded,
                               isActive,
                               isSoldOut
                           }: {
    onMint: () => Promise<void>;
    candyMachine?: CandyMachineAccount;
    isMinting: boolean;
    isEnded: boolean;
    isActive: boolean;
    isSoldOut: boolean;
}) => {
    const {requestGatewayToken, gatewayStatus} = useGateway();
    const [clicked, setClicked] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        setIsVerifying(false);
        if (gatewayStatus === GatewayStatus.COLLECTING_USER_INFORMATION && clicked) {
            // when user approves wallet verification txn
            setIsVerifying(true);
        } else if (gatewayStatus === GatewayStatus.ACTIVE && clicked) {
            // console.log('Verified human, now minting...');
            onMint();
            setClicked(false);
        }
    }, [gatewayStatus, clicked, setClicked, onMint]);

    return (
        <CTAButton
            disabled={
                clicked ||
                candyMachine?.state.isSoldOut ||
                isSoldOut ||
                isMinting ||
                isEnded ||
                !isActive ||
                isVerifying
            }
            onClick={async () => {
                if (isActive && candyMachine?.state.gatekeeper && gatewayStatus !== GatewayStatus.ACTIVE) {
                    // console.log('Requesting gateway token');
                    setClicked(true);
                    await requestGatewayToken();
                } else {
                    // console.log('Minting...');
                    await onMint();
                }
            }}
            variant="contained"
        >
            {!candyMachine ? (
                "Connecting..."
            ) : candyMachine?.state.isSoldOut || isSoldOut ? (
                'Sold Out'
            ) : isActive ? (
                isVerifying ? 'Verifying...' :
                    isMinting || clicked ? (
                        <CircularProgress/>
                    ) : (
                        "Mint"
                    )
            ) : isEnded ? "Ended" : (candyMachine?.state.goLiveDate ? (
                "Soon"
            ) : (
                "Unavailable"
            ))}
        </CTAButton>
    );
};
