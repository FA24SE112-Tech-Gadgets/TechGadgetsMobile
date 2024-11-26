import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
    TextInput,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import api from '../../Authorization/api';
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import RnModal from "react-native-modal";
import ErrModal from '../../CustomComponents/ErrModal';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Snackbar } from 'react-native-paper';
import ReviewSummary from '../../Buyer/BuyerReview/ReviewSummary';

export default function GadgetSellerDetail({ route, navigation }) {
    const [gadget, setGadget] = useState(null);
    const [activeTab, setActiveTab] = useState('specs');

    const [newIsForSale, setNewIsForSale] = useState(false);
    const [newQuantity, setNewQuantity] = useState(0);

    const [showBottomBar, setShowBottomBar] = useState(true);

    const [isForSaleModalVisible, setIsForSaleModalVisible] = useState(false);

    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isContentExpanded, setIsContentExpanded] = useState(false);

    const [isFetching, setIsFetching] = useState(false);
    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const formatVietnamDate = (time) => {
        const date = new Date(time);
        const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
        const day = vietnamTime.getUTCDate().toString().padStart(2, '0');
        const month = (vietnamTime.getUTCMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = vietnamTime.getUTCFullYear();

        return `${day}/${month}/${year}`;
    };

    {/* Group Specification*/ }
    const groupSpecifications = (specs) => {
        return specs.reduce((acc, spec) => {
            const key = spec.specificationKey.name;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(spec);
            return acc;
        }, {});
    };

    // Fetch gadget detail
    useFocusEffect(
        useCallback(() => {
            fetchGadgetDetail();
        }, [])
    );

    //Reset new quantity, new IsForSale
    useFocusEffect(
        useCallback(() => {
            if (gadget?.quantity) {
                setNewQuantity(gadget.quantity);
            } else {
                setNewQuantity(0);
            }

            if (gadget?.isForSale) {
                setNewIsForSale(gadget.isForSale);
            } else {
                setNewIsForSale(false);
            }
        }, [gadget])
    );

    // Reset expanded state when switching tabs
    useFocusEffect(
        useCallback(() => {
            setIsContentExpanded(false);
        }, [activeTab])
    );

    const fetchGadgetDetail = async () => {
        try {
            setIsFetching(true);
            const response = await api.get(`/gadgets/${route.params.gadgetId}`);
            setGadget(response.data);
            setIsFetching(false);
        } catch (error) {
            console.log('Error fetching gadget details:', error);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
            setIsFetching(false);
        }
    };

    const handleUpdateGadget = async () => {
        setIsFetching(true);
        if (newIsForSale != gadget.isForSale) {
            try {
                await api.put(`/gadgets/${route.params.gadgetId}/${newIsForSale ? "set-for-sale" : "set-not-for-sale"}`);
            } catch (error) {
                console.log('Error updating gadget details:', error);
                setStringErr(
                    error.response?.data?.reasons[0]?.message ?
                        error.response.data.reasons[0].message
                        :
                        "Lỗi mạng vui lòng thử lại sau"
                );
                setIsError(true);
                setIsFetching(false);
            }
        } else if (newQuantity != gadget.quantity) {
            try {
                await api.put(`/gadgets/${route.params.gadgetId}/quantity`, {
                    quantity: newQuantity
                });
            } catch (error) {
                console.log('Error updating gadget details:', error);
                setStringErr(
                    error.response?.data?.reasons[0]?.message ?
                        error.response.data.reasons[0].message
                        :
                        "Lỗi mạng vui lòng thử lại sau"
                );
                setIsError(true);
                setIsFetching(false);
            }
        }
        setSnackbarMessage("Cập nhật thành công");
        setSnackbarVisible(true);
        setIsFetching(false);
        fetchGadgetDetail();
    }

    if (!gadget) {
        return (
            <LinearGradient colors={['#fea92866', '#FFFFFF']}
                style={{
                    flex: 1,
                    height: ScreenHeight / 1.5,
                }}
            >
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <LottieView
                        source={require("../../../assets/animations/catRole.json")}
                        style={{ width: ScreenWidth, height: ScreenWidth / 1.5 }}
                        autoPlay
                        loop
                        speed={0.8}
                    />
                    <Text
                        style={{
                            fontSize: 18,
                            width: ScreenWidth / 1.5,
                            textAlign: "center",
                        }}
                    >
                        {isFetching ? "Đang load dữ liệu" : "Không tìm thấy sản phẩm"}
                    </Text>
                </View>
            </LinearGradient>
        );
    }

    const ImageGalleryModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={imageModalVisible}
            onRequestClose={() => setImageModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setImageModalVisible(false)}
                >
                    <AntDesign name="close" size={24} color="white" />
                </TouchableOpacity>
                <FlatList
                    data={gadget.gadgetImages}
                    horizontal
                    pagingEnabled
                    initialScrollIndex={selectedImageIndex}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <>
                            <Image
                                source={{ uri: item.imageUrl }}
                                style={styles.modalImage}
                                resizeMode="contain"
                            />
                            {gadget.status !== "Active" && (
                                <View style={styles.statusWatermark}>
                                    <Text style={styles.statusText}>Sản phẩm đã bị khóa do vi phạm chính sách TechGadget</Text>
                                </View>
                            )}
                        </>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    getItemLayout={(data, index) => (
                        { length: ScreenWidth, offset: ScreenWidth * index, index }
                    )}
                />
            </View>
        </Modal>
    );

    const ChooseForSaleModal = () => (
        <RnModal
            isVisible={isForSaleModalVisible}
            onBackdropPress={() => setIsForSaleModalVisible(false)}
            onSwipeComplete={() => setIsForSaleModalVisible(false)}
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
                                backgroundColor: "#fea128",
                                borderRadius: 30,
                            }}
                        />
                    </View>

                    {/* Đang kinh doanh */}
                    <Pressable
                        style={styles.modalOption}
                        onPress={() => {
                            setNewIsForSale(true)
                            setIsForSaleModalVisible(false)
                        }}
                    >
                        <Text style={styles.modalOptionText}>Đang kinh doanh</Text>
                        {newIsForSale ? (
                            <MaterialCommunityIcons name="check-circle" size={24} color="#fea128" />
                        ) : (
                            <MaterialCommunityIcons
                                name="checkbox-blank-circle-outline"
                                size={24}
                                color="#fea128"
                            />
                        )}
                    </Pressable>

                    {/* Ngừng kinh doanh */}
                    <Pressable
                        style={styles.modalOption}
                        onPress={() => {
                            setNewIsForSale(false)
                            setIsForSaleModalVisible(false)
                        }}
                    >
                        <Text style={styles.modalOptionText}>Ngừng bán</Text>
                        {!newIsForSale ? (
                            <MaterialCommunityIcons name="check-circle" size={24} color="#fea128" />
                        ) : (
                            <MaterialCommunityIcons
                                name="checkbox-blank-circle-outline"
                                size={24}
                                color="#fea128"
                            />
                        )}
                    </Pressable>
                </View>
            </View>
        </RnModal>
    );

    return (
        <LinearGradient colors={['#fea92866', '#FFFFFF']} style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={() => {
                    setShowBottomBar(false);
                }}
                onMomentumScrollEnd={() => {
                    setShowBottomBar(true);
                }}
                contentContainerStyle={{
                    paddingBottom: ScreenWidth / 4.5
                }}
            >
                {/* Main Image with Brand Logo */}
                <View style={{
                    position: 'relative',
                    width: ScreenWidth,
                    height: ScreenHeight / 2.5,
                }}>
                    {/* Gadget Images */}
                    <FlatList
                        data={gadget.gadgetImages}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    setSelectedImageIndex(index);
                                    setImageModalVisible(true);
                                }}
                                style={styles.imageBtn}
                            >
                                <View style={styles.gadgetImageItem}>
                                    <Image
                                        source={{ uri: item.imageUrl }}
                                        style={styles.gadgetImage}
                                        resizeMode="contain"
                                    />
                                    {gadget.status !== "Active" && (
                                        <View style={styles.statusWatermark}>
                                            <Text style={styles.statusText}>Sản phẩm đã bị khóa do vi phạm chính sách TechGadget</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item, index) => index}
                    />

                    {/* Back Button */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <AntDesign name="arrowleft" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Brand Logo */}
                    <View style={styles.brandLogoContainer}>
                        <Image
                            source={{ uri: gadget.brand.logoUrl }}
                            style={styles.brandLogo}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Gadget Info */}
                <View style={styles.gadgetInfo}>
                    <Text style={styles.gadgetName}>{gadget.name}</Text>
                    {gadget.discountPercentage > 0 ? (
                        <>
                            <View style={styles.priceContainer}>
                                <View style={{
                                    flexDirection: "row",
                                    gap: 10,
                                    alignItems: "center"
                                }}>
                                    <Text style={styles.originalPrice}>
                                        {gadget.price.toLocaleString('vi-VN')} ₫
                                    </Text>
                                    {gadget.discountPercentage > 0 && (
                                        <View style={styles.discountBadge}>
                                            <Text style={styles.discountBadgeText}>-{gadget.discountPercentage}%</Text>
                                        </View>
                                    )}

                                </View>
                                <Text style={styles.discountPrice}>
                                    {gadget.discountPrice.toLocaleString('vi-VN')} ₫
                                </Text>
                            </View>
                            {gadget.discountExpiredDate && (
                                <View style={{
                                    flexDirection: "row",
                                    gap: 10
                                }}>
                                    <Text style={styles.discountExpiry}>
                                        Ưu đãi còn đến:
                                    </Text>
                                    <Text style={{
                                        color: "red",
                                        fontWeight: "bold"
                                    }}>
                                        {formatVietnamDate(gadget.discountExpiredDate)}
                                    </Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <Text style={styles.gadgetPrice}>
                            {gadget.price.toLocaleString('vi-VN')} ₫
                        </Text>
                    )}
                    <Text style={styles.condition}>Tình trạng:</Text>
                    <Text style={{
                        backgroundColor: "#F9F9F9",
                        padding: 10,
                        height: ScreenHeight / 10,
                        borderWidth: 1,
                        borderColor: "grey",
                        borderRadius: 10
                    }}>
                        {gadget.condition}
                    </Text>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'specs' && styles.activeTab]}
                        onPress={() => setActiveTab('specs')}
                    >
                        <Text style={[styles.tabText, activeTab === 'specs' && styles.activeTabText]}>
                            Thông số kỹ thuật
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'desc' && styles.activeTab]}
                        onPress={() => setActiveTab('desc')}
                    >
                        <Text style={[styles.tabText, activeTab === 'desc' && styles.activeTabText]}>
                            Bài viết đánh giá
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <View style={styles.tabContent}>
                    {activeTab === 'specs' ? (
                        <View style={styles.specsContainer}>
                            {Object.entries(groupSpecifications(gadget.specificationValues))
                                .slice(0, isContentExpanded ? undefined : 4)
                                .map(([key, specs], index, array) => (
                                    <View key={key}>
                                        <View style={styles.specRow}>
                                            <View style={styles.specKeyContainer}>
                                                <Text style={styles.specKey}>{key}</Text>
                                            </View>
                                            <View style={styles.specValueContainer}>
                                                {specs.map((spec, i) => (
                                                    <View key={i} style={styles.specValueRow}>
                                                        <Text style={styles.specValue}>
                                                            {spec.value}{spec.specificationUnit?.name || ''}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                        {index < array.length - 1 && <View style={styles.separator} />}
                                    </View>
                                ))}
                            {Object.entries(groupSpecifications(gadget.specificationValues)).length > 4 && (
                                <TouchableOpacity
                                    style={styles.expandButton}
                                    onPress={() => setIsContentExpanded(!isContentExpanded)}
                                >
                                    <Text style={styles.expandButtonText}>
                                        {isContentExpanded ? 'Thu gọn' : 'Xem thêm'}
                                    </Text>
                                    <AntDesign
                                        name={isContentExpanded ? "up" : "down"}
                                        size={16}
                                        color="#fea128"
                                        style={styles.expandIcon}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View style={styles.descContainer}>
                            {gadget.gadgetDescriptions
                                .sort((a, b) => a.index - b.index)
                                .slice(0, isContentExpanded ? undefined : 2)
                                .map((desc, index) => (
                                    <View key={index} style={styles.descriptionItem}>
                                        {desc.type === 'Image' ? (
                                            <Image
                                                source={{ uri: desc.value }}
                                                style={styles.descriptionImage}
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <Text
                                                style={[
                                                    styles.descriptionText,
                                                    desc.type === 'BoldText' && styles.boldText,
                                                ]}
                                            >
                                                {desc.value}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            {gadget.gadgetDescriptions.length > 2 && (
                                <TouchableOpacity
                                    style={styles.expandButton}
                                    onPress={() => setIsContentExpanded(!isContentExpanded)}
                                >
                                    <Text style={styles.expandButtonText}>
                                        {isContentExpanded ? 'Thu gọn' : 'Xem thêm'}
                                    </Text>
                                    <AntDesign
                                        name={isContentExpanded ? "up" : "down"}
                                        size={16}
                                        color="#fea128"
                                        style={styles.expandIcon}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                <ReviewSummary
                    gadgetId={route.params.gadgetId}
                    navigation={navigation}
                    setIsError={setIsError}
                    setStringErr={setStringErr}
                />
            </ScrollView >

            {/* Bottom Bar */}
            {
                showBottomBar &&
                <View View style={styles.bottomBar} >
                    {/* Gadget quantity */}
                    <View style={styles.quantityContainer}>
                        <Text style={styles.quantityText}>Kho:</Text>
                        <TextInput
                            style={{
                                backgroundColor: "#F9F9F9",
                                borderRadius: 10,
                                width: 50,
                                textAlign: "center"
                            }} value={newQuantity.toString()} keyboardType='number-pad'
                            onChangeText={(text) => {
                                setNewQuantity(text)
                            }}
                        />
                    </View>

                    {/* Gadget isForSale */}
                    <TouchableOpacity
                        style={[
                            {
                                backgroundColor: newIsForSale ? "rgba(77, 218, 98,0.5)" : "rgba(210, 65, 82,0.5)",
                                borderColor: newIsForSale ? "rgb(77, 218, 98)" : "rgb(210, 65, 82)",
                            },
                            styles.gadgetStatusBtn
                        ]}
                        onPress={() => {
                            setIsForSaleModalVisible(true)
                        }}
                    >
                        <Text style={styles.gadgetStatusTxt}>{newIsForSale ? "Đang kinh doanh" : "Ngừng bán"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        disabled={(newIsForSale == gadget.isForSale && newQuantity == gadget.quantity) || isFetching}
                        onPress={() => {
                            if (gadget.status !== "Active") {
                                setStringErr(
                                    "Sản phẩm của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết."
                                );
                                setIsError(true);
                            } else {
                                handleUpdateGadget();
                            }
                        }}
                    >
                        {
                            isFetching ?
                                <ActivityIndicator size={24} color="#ed8900" />
                                :
                                <Ionicons
                                    name="checkbox"
                                    size={55}
                                    color={(newIsForSale != gadget.isForSale || newQuantity != gadget.quantity) ? "rgb(77, 218, 98)" : "rgba(0, 0, 0, 0.5)"}
                                />
                        }
                    </TouchableOpacity>
                </View >
            }

            <ImageGalleryModal />
            <ChooseForSaleModal />

            <ErrModal
                stringErr={stringErr}
                isError={isError}
                setIsError={setIsError}
            />

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={1500}
                wrapperStyle={{ bottom: 0, zIndex: 3, alignSelf: "center" }}
            >
                {snackbarMessage}
            </Snackbar>
        </LinearGradient >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
    },
    backButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 8,
        borderRadius: 20,
    },
    mainimageBtn: {
        position: 'relative',
        width: ScreenWidth,
        height: ScreenWidth,
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    brandLogoContainer: {
        position: 'absolute',
        bottom: '5%',
        left: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 8,
        borderRadius: 28,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: "rgba(254, 169, 40, 0.5)"
    },
    brandLogo: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    discountBadge: {
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
        zIndex: 1,
        borderWidth: 0.5,
        borderColor: "grey"
    },
    discountBadgeText: {
        color: 'grey',
        fontSize: 16,
        fontWeight: '500',
    },
    priceContainer: {
        marginBottom: 8,
    },
    originalPrice: {
        fontSize: 17,
        color: '#999',
        textDecorationLine: 'line-through',
        marginBottom: 4,
    },
    discountPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fea128',
    },
    discountExpiry: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    imageBtn: {
        justifyContent: "center",
        alignItems: "center",
        width: ScreenWidth
    },
    gadgetImageItem: {
        justifyContent: "center",
        width: ScreenWidth / 1.1,
        alignItems: "center",
        backgroundColor: "white",
        height: ScreenHeight / 3,
        borderWidth: 1.5,
        borderRadius: 15,
        borderColor: "rgb(254, 169, 40)"
    },
    gadgetImage: {
        width: ScreenWidth / 1.2,
        height: ScreenHeight / 2,
        borderRadius: 8,
    },
    statusWatermark: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: 15,
        paddingHorizontal: 15
    },
    statusText: {
        color: 'red',
        fontSize: 20,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    gadgetInfo: {
        paddingHorizontal: 16,
        paddingVertical: 10
    },
    gadgetName: {
        fontSize: 24,
        fontWeight: '500',
        marginBottom: 8,
    },
    gadgetPrice: {
        fontSize: 20,
        color: '#fea128',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    condition: {
        fontSize: 16,
        color: '#666',
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#fea128',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        color: '#fea128',
        fontWeight: 'bold',
    },
    tabContent: {
        padding: 16,
    },
    specsContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginTop: 8,
    },
    descContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginTop: 8,
    },
    specRow: {
        flexDirection: 'row',
        paddingVertical: 12,
    },
    specKeyContainer: {
        flex: 2,
        paddingRight: 16,
    },
    specValueContainer: {
        flex: 3,
    },
    specValueRow: {
        marginBottom: 2,
    },
    specKey: {
        fontSize: 16,
        color: 'black',
        flexWrap: 'wrap',
        fontWeight: 'bold',
    },
    specValue: {
        fontSize: 15,
        color: '#333',
        flexWrap: 'wrap',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        width: '100%',
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    expandButtonText: {
        color: '#fea128',
        fontSize: 14,
        fontWeight: '500',
        marginRight: 4,
    },
    expandIcon: {
        marginLeft: 4,
    },
    descriptionItem: {
        marginBottom: 16,
    },
    descriptionImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
    },
    boldText: {
        fontWeight: 'bold',
    },
    bottomBar: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 15,
        margin: 10,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: 'rgb(254, 169, 40)',
        backgroundColor: 'rgba(254, 169, 40, 0.3)',
        justifyContent: "space-around",
        alignItems: "center",
        gap: 10
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "rgba(254, 161, 40, 0.5)",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgb(254, 161, 40)",
        gap: 5,
        paddingHorizontal: 5,
        height: 50
    },
    quantityButton: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    quantityText: {
        paddingHorizontal: 5,
        fontSize: 18,
    },
    gadgetStatusBtn: {
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: "center",
        flex: 1
    },
    gadgetStatusTxt: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    modalImage: {
        width: ScreenWidth,
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 16,
        zIndex: 1,
        padding: 8,
    },
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