import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    Pressable,
    StyleSheet,
    TextInput,
    Dimensions,
    Linking,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Icon } from '@rneui/base';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Modal from "react-native-modal";
import ErrModal from '../../CustomComponents/ErrModal';
import api from '../../Authorization/api';

export default function Component() {
    const navigation = useNavigation();
    const [isDepositModalVisible, setDepositModalVisible] = useState(false);
    const [isPaymentMethodModalVisible, setPaymentMethodModalVisible] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('VnPay');
    const [error, setError] = useState('');
    const [isError, setIsError] = useState(false);
    const [stringErr, setStringErr] = useState('');
    const [walletTrackingId, setWalletTrackingId] = useState(null);
    const [depositStatus, setDepositStatus] = useState(null);
    const [showStatusOverlay, setShowStatusOverlay] = useState(false);
    const [balance, setBalance] = useState(null);
    const [isBalanceVisible, setIsBalanceVisible] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const fetchBalance = async () => {
        try {
            const response = await api.get('/users/current');
            setBalance(response.data.wallet.amount);
        } catch (error) {
            console.log('Error fetching balance:', error);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    const toggleBalanceVisibility = async () => {
        if (!isBalanceVisible) {
            await fetchBalance();
        }
        setIsBalanceVisible(!isBalanceVisible);
    };

    const formatBalance = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const checkDepositStatus = useCallback(async () => {
        if (!walletTrackingId) return;

        try {
            const response = await api.get(`/wallet-trackings/${walletTrackingId}`);
            const { status } = response.data;
            if (status === 'Success' || status === 'Cancelled') {
                setDepositStatus(status);
                setShowStatusOverlay(true);
                setWalletTrackingId(null);
                await fetchBalance();
            }
        } catch (error) {
            console.log('Error checking deposit status:', error);
        }
    }, [walletTrackingId]);

    useEffect(() => {
        let intervalId;
        if (walletTrackingId) {
            intervalId = setInterval(checkDepositStatus, 5000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [walletTrackingId, checkDepositStatus]);

    const handleDeposit = async () => {
        if (!depositAmount || isNaN(Number(depositAmount))) {
            setIsError(true);
            setStringErr('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        try {
            setIsFetching(true);
            const response = await api.post('/wallet/deposit', {
                amount: Number(depositAmount),
                paymentMethod: paymentMethod,
                returnUrl: 'techgadgets://BuyerWallet'
            });

            if (response.data && response.data.depositUrl && response.data.walletTrackingId) {
                setWalletTrackingId(response.data.walletTrackingId);
                const canOpen = await Linking.canOpenURL(response.data.depositUrl);
                if (canOpen) {
                    await Linking.openURL(response.data.depositUrl);
                } else {
                    setIsError(true);
                    setStringErr('Không thể mở liên kết thanh toán. Vui lòng thử lại sau.');
                }
                setDepositModalVisible(false);
            } else {
                setIsError(true);
                setStringErr('Không nhận được liên kết thanh toán. Vui lòng thử lại.');
            }
            setIsFetching(false);
        } catch (error) {
            setStringErr(error.response?.data?.reasons?.[0]?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
            setIsError(true);
            setIsFetching(false);
        }
    };

    const renderStatusOverlay = () => {
        if (!showStatusOverlay) return null;

        return (
            <TouchableWithoutFeedback onPress={() => setShowStatusOverlay(false)}>
                <View style={styles.overlayContainer}>
                    <View style={styles.overlayContent}>
                        {depositStatus === 'Success' ? (
                            <>
                                <Icon name="checkcircle" type="antdesign" color="green" size={50} />
                                <Text style={styles.overlayText}>Bạn đã nạp tiền thành công!</Text>
                            </>
                        ) : (
                            <>
                                <Icon name="closecircle" type="antdesign" color="red" size={50} />
                                <Text style={styles.overlayText}>Nạp tiền không thành công!</Text>
                            </>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    const PaymentMethodModal = () => (
        <Modal
            isVisible={isPaymentMethodModalVisible}
            onBackdropPress={() => setPaymentMethodModalVisible(false)}
            onSwipeComplete={() => setPaymentMethodModalVisible(false)}
            swipeDirection="down"
            style={styles.modal}
        >
            <View style={styles.modalContent}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Phương thức thanh toán</Text>
                {['VnPay', 'Momo', 'PayOS'].map((method) => (
                    <Pressable
                        key={method}
                        style={styles.paymentMethodItem}
                        onPress={() => {
                            setPaymentMethod(method);
                            setPaymentMethodModalVisible(false);
                        }}
                    >
                        <Text style={styles.paymentMethodText}>{method}</Text>
                        {paymentMethod === method && (
                            <Icon name="check" type="material" color="#ed8900" size={24} />
                        )}
                    </Pressable>
                ))}
            </View>
        </Modal>
    );

    return (
        <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.8 }}
            colors={['#FFFFFF', '#fea92866']}
            style={styles.container}
        >
            <ScrollView
                style={styles.scrollView}
                overScrollMode="never"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.logoContainer}>
                    <View style={styles.logoImageContainer}>
                        <Image
                            style={styles.logoImage}
                            source={require('../../../assets/adaptive-icon.png')}
                        />
                    </View>
                    <MaskedView
                        maskElement={
                            <Text style={styles.logoText}>
                                TechGadget
                            </Text>
                        }
                    >
                        <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.6, y: 0.6 }}
                            colors={['#fea92866', '#ed8900']}
                        >
                            <Text style={[styles.logoText, { opacity: 0 }]}>
                                TechGadget
                            </Text>
                        </LinearGradient>
                    </MaskedView>
                </View>

                <Text style={styles.title}>
                    Ví của tôi
                </Text>
                <View style={styles.descriptionContainer}>
                    <Text style={styles.description}>
                        Quản lý các giao dịch và thông tin tài chính của bạn trên TechGadget.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>
                    Thông tin Ví
                </Text>
                <View style={styles.walletInfoContainer}>
                    <View style={styles.walletBalanceContainer}>
                        <View style={styles.balanceTextContainer}>
                            <Text style={styles.balanceLabel}>Số dư ví:</Text>
                            <Text style={styles.balanceAmount}>
                                {isBalanceVisible && balance !== null ? formatBalance(balance) : '*****'}
                            </Text>
                        </View>
                        <Pressable onPress={async () => {
                            await toggleBalanceVisibility();
                        }} style={styles.eyeIconContainer}>
                            <Ionicons name={isBalanceVisible ? "eye-off" : "eye"} size={24} color="#ed8900" />
                        </Pressable>
                    </View>

                    <Pressable
                        style={styles.walletInfoItem}
                        onPress={() => setDepositModalVisible(true)}
                    >
                        <View style={styles.iconContainer}>
                            <FontAwesome name="money" size={20} color="#ed8900" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.itemText}>Nạp tiền</Text>
                        </View>
                        <Icon type="antdesign" name="right" color="#ed8900" size={20} />
                    </Pressable>

                    <Pressable
                        style={styles.walletInfoItem}
                        onPress={() => {
                            navigation.navigate("DepositHistory");
                        }}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="history" size={20} color="#ed8900" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.itemText}>Lịch sử nạp tiền</Text>
                        </View>
                        <Icon type="antdesign" name="right" color="#ed8900" size={20} />
                    </Pressable>

                    <Pressable
                        style={styles.walletInfoItem}
                        onPress={() => {
                            navigation.navigate("RefundHistory");
                        }}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="refresh" size={20} color="#ed8900" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.itemText}>Lịch sử hoàn tiền</Text>
                        </View>
                        <Icon type="antdesign" name="right" color="#ed8900" size={20} />
                    </Pressable>

                    <Pressable
                        style={styles.walletInfoItem}
                        onPress={() => {
                            navigation.navigate("PaymentHistory");
                        }}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="card-outline" size={20} color="#ed8900" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.itemText}>Lịch sử thanh toán</Text>
                        </View>
                        <Icon type="antdesign" name="right" color="#ed8900" size={20} />
                    </Pressable>
                </View>
            </ScrollView>

            <Modal
                isVisible={isDepositModalVisible}
                onBackdropPress={() => setDepositModalVisible(false)}
                onSwipeComplete={() => setDepositModalVisible(false)}
                swipeDirection="down"
                style={styles.modal}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHandle} />
                    <Text style={styles.modalTitle}>Nạp tiền</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập số tiền"
                        keyboardType="numeric"
                        value={depositAmount}
                        onChangeText={setDepositAmount}
                    />
                    <Pressable
                        style={styles.paymentMethodButton}
                        onPress={() => setPaymentMethodModalVisible(true)}
                    >
                        <Text style={styles.paymentMethodButtonText}>{paymentMethod}</Text>
                        <Icon type="antdesign" name="down" color="#ed8900" size={20} />
                    </Pressable>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <Pressable
                        style={styles.depositButton}
                        onPress={async () => {
                            await handleDeposit();
                        }}
                        disabled={isFetching}
                    >
                        <Text style={styles.depositButtonText}>Nạp tiền</Text>
                        {
                            isFetching &&
                            <ActivityIndicator color={"white"} />
                        }
                    </Pressable>
                </View>
            </Modal>

            <PaymentMethodModal />

            <ErrModal
                stringErr={stringErr}
                isError={isError}
                setIsError={setIsError}
            />
            {renderStatusOverlay()}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        paddingHorizontal: 14,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 10,
    },
    logoImageContainer: {
        height: 40,
        width: 40,
        overflow: 'hidden',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: 48,
        height: 48,
    },
    logoText: {
        backgroundColor: 'transparent',
        fontSize: 28,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
        textAlignVertical: 'center',
        marginTop: 20,
    },
    descriptionContainer: {
        paddingHorizontal: 10,
        marginTop: 10,
    },
    description: {
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
    },
    walletInfoContainer: {
        marginTop: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 5,
    },
    walletInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        marginLeft: 10,
    },
    itemText: {
        fontSize: 15,
        overflow: 'hidden',
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#fea92866',
        borderRadius: 3,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderColor: '#B7B7B7',
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        fontSize: 15,
        width: '100%',
        marginBottom: 10,
    },
    paymentMethodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderColor: '#B7B7B7',
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 10,
        width: '100%',
    },
    paymentMethodButtonText: {
        fontSize: 16,
    },
    depositButton: {
        backgroundColor: '#ed8900',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginTop: 10,
        width: '100%',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10
    },
    depositButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
    },
    overlayText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
    },
    walletBalanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    balanceTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    balanceAmount: {
        fontSize: 16,
    },
    eyeIconContainer: {
        padding: 5,
    },
    paymentMethodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        width: '100%',
    },
    paymentMethodText: {
        fontSize: 16,
    },
});