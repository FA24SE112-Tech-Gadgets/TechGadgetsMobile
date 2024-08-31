import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import "core-js/stable/atob";
import Modal from "react-native-modal";
import { ScreenHeight, ScreenWidth } from "@rneui/base";
import i18next from "../../services/i18next";
import languagesList from '../../services/languagesList.json';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useState } from "react";

export default function LanguageModal({ openChooseLanguage, setOpenChooseLanguage }) {
    const [languageCHoose, setLanguageChoose] = useState(i18next.language);

    const changeLng = (lng) => {
        i18next.changeLanguage(lng);
    };

    return (
        <Modal
            isVisible={openChooseLanguage}
            onBackdropPress={() => setOpenChooseLanguage(false)}
            onSwipeComplete={() => setOpenChooseLanguage(false)}
            useNativeDriverForBackdrop
            swipeDirection={"down"}
            propagateSwipe={true}
            style={{
                justifyContent: 'flex-end',
                margin: 0,
            }}
        >
            <View>
                <View style={styles.modalContent}>
                    {/* Thanh hồng trên cùng */}
                    <View
                        style={{
                            alignItems: "center",
                            padding: 12,
                        }}
                    >
                        <View
                            style={{
                                width: ScreenWidth / 7,
                                height: ScreenHeight / 80,
                                backgroundColor: "#FB6562",
                                borderRadius: 30,
                            }}
                        />
                    </View>

                    {/* VI */}
                    <Pressable
                        style={styles.modalOption}
                        onPress={() => {
                            changeLng("vi")
                            setLanguageChoose("vi")
                            setOpenChooseLanguage(false)
                        }}
                    >
                        <Text style={styles.modalOptionText}>{languagesList["vi"].nativeName}</Text>
                        {languageCHoose === "vi" ? (
                            <MaterialCommunityIcons name="check-circle" size={24} color="#FB6562" />
                        ) : (
                            <MaterialCommunityIcons
                                name="checkbox-blank-circle-outline"
                                size={24}
                                color="#FB6562"
                            />
                        )}
                    </Pressable>

                    {/* EN */}
                    <Pressable
                        style={styles.modalOption}
                        onPress={() => {
                            changeLng("en")
                            setLanguageChoose("en")
                            setOpenChooseLanguage(false)
                        }}
                    >
                        <Text style={styles.modalOptionText}>{languagesList["en"].nativeName}</Text>
                        {languageCHoose === "en" ? (
                            <MaterialCommunityIcons name="check-circle" size={24} color="#FB6562" />
                        ) : (
                            <MaterialCommunityIcons
                                name="checkbox-blank-circle-outline"
                                size={24}
                                color="#FB6562"
                            />
                        )}
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    modalOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    modalOptionText: {
        fontSize: 16,
    },
});