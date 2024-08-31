import React from 'react'
import { useTranslation } from 'react-i18next';
import SubscriptionComponent from '../CustomComponents/SubscriptionComponent';
import Modal from 'react-native-modal';
import { Snackbar } from 'react-native-paper';

export default function CustomerSubcription({
    openSubscription,
    setOpenSubscription,
    isError,
    setIsError,
    setStringErr,
    isDisable,
    setDisable,
    createPaymentLink,
    snackbarVisible,
    setSnackbarVisible,
    snackbarMessage
}) {
    const { t } = useTranslation();
    const vipPack = {
        name: "VIP",
        price: "29.000đ",
        actualPrice: "59.000đ",
        arrContent: [t("vipContent")],
    };
    return (
        <Modal
            isVisible={openSubscription && !isError}
            onBackdropPress={() => setOpenSubscription(false)}
            propagateSwipe={true}
            style={{
                alignItems: "center",
            }}
        >
            <SubscriptionComponent
                packageNumber={3}
                pack={vipPack}
                createPaymentLink={createPaymentLink}
                setIsError={setIsError}
                setStringErr={setStringErr}
                isDisable={isDisable}
                setDisable={setDisable}
                role={"user"}
                setOpenSubscription={setOpenSubscription}
            />
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={1500}
                wrapperStyle={{ bottom: 0, zIndex: 1 }}
            >
                {snackbarMessage}
            </Snackbar>
        </Modal>
    )
}