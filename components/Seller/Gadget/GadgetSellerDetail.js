import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal,
    FlatList,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import api from '../../Authorization/api';
import Ionicons from "react-native-vector-icons/Ionicons";
import { ScreenHeight, ScreenWidth } from '@rneui/base';

const { width } = Dimensions.get('window');

export default function GadgetSellerDetail({ route, navigation }) {
    const [gadget, setGadget] = useState(null);
    const [activeTab, setActiveTab] = useState('specs');
    const [quantity, setQuantity] = useState(1);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isContentExpanded, setIsContentExpanded] = useState(false);
    const formatVietnamDate = (time) => {
        const date = new Date(time);
        const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
        const day = vietnamTime.getUTCDate().toString().padStart(2, '0');
        const month = (vietnamTime.getUTCMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = vietnamTime.getUTCFullYear();

        return `${day}/${month}/${year}`;
    };



    useEffect(() => {
        fetchGadgetDetail();
    }, []);

    // Reset expanded state when switching tabs
    useEffect(() => {
        setIsContentExpanded(false);
    }, [activeTab]);

    const fetchGadgetDetail = async () => {
        try {
            const response = await api.get(`/gadgets/${route.params.gadgetId}`);
            setGadget(response.data);
        } catch (error) {
            console.error('Error fetching gadget details:', error);
        }
    };

    if (!gadget) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
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
                        <Image
                            source={{ uri: item }}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    getItemLayout={(data, index) => (
                        { length: width, offset: width * index, index }
                    )}
                />
            </View>
        </Modal>
    );

    return (
        <LinearGradient colors={['#fea92866', '#FFFFFF']} style={styles.container}>
            <ScrollView>
                {/* Main Image with Brand Logo */}
                <View style={{
                    position: 'relative',
                    width: ScreenWidth,
                    height: ScreenHeight / 2.5,
                }}>
                    {/* Gadget Images */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {gadget.gadgetImages.map((image, index) => (
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
                                        source={{ uri: image }}
                                        style={styles.gadgetImage}
                                        resizeMode="contain"
                                    />
                                    {!gadget.isForSale && (
                                        <View style={styles.soldOutWatermark}>
                                            <Text style={styles.soldOutText}>Ngừng kinh doanh</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

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



                {/* Product Info */}
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{gadget.name}</Text>
                    {gadget.discountPercentage > 0 ? (
                        <>
                            <View style={styles.priceContainer}>
                                <Text style={styles.originalPrice}>
                                    {gadget.price.toLocaleString('vi-VN')} ₫
                                </Text>
                                <Text style={styles.discountPrice}>
                                    {gadget.discountPrice.toLocaleString('vi-VN')} ₫
                                </Text>
                            </View>
                            {gadget.discountPercentage > 0 && (
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountBadgeText}>-{gadget.discountPercentage}%</Text>
                                </View>
                            )}
                            {gadget.discountExpiredDate && (
                                <Text style={styles.discountExpiry}>
                                    Ưu đãi còn đến: {formatVietnamDate(gadget.discountExpiredDate)}
                                </Text>
                            )}
                        </>
                    ) : (
                        <Text style={styles.productPrice}>
                            {gadget.price.toLocaleString('vi-VN')} ₫
                        </Text>
                    )}
                    <Text style={styles.condition}>Tình trạng: {gadget.condition}</Text>
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
                            {gadget.specificationValues.slice(0, isContentExpanded ? undefined : 4).map((spec, index) => (
                                <View key={index}>
                                    <View style={styles.specRow}>
                                        <View style={styles.specKeyContainer}>
                                            <Text style={styles.specKey}>{spec.specificationKey}</Text>
                                        </View>
                                        <View style={styles.specValueContainer}>
                                            <Text style={styles.specValue}>
                                                {spec.specificationKey === 'Thời điểm ra mắt' ? formatVietnamDate(spec.value) : spec.value} {spec.specificationUnit}
                                            </Text>
                                        </View>
                                    </View>

                                    {index < (isContentExpanded ? gadget.specificationValues.length - 1 : 3) && (
                                        <View style={styles.separator} />
                                    )}
                                </View>
                            ))}
                            {gadget.specificationValues.length > 4 && (
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
            </ScrollView >

            {/* Bottom Bar */}
            <View View style={styles.bottomBar} >
                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityText}>Kho:</Text>
                    <TextInput style={{
                        backgroundColor: "#F9F9F9",
                        borderRadius: 10,
                        width: 50,
                        textAlign: "center"
                    }} value={gadget.quantity.toString()} keyboardType='number-pad' />
                </View>
                <TouchableOpacity
                    style={[
                        {
                            backgroundColor: gadget.isForSale ? "rgba(77, 218, 98,0.5)" : "rgba(210, 65, 82,0.5)",
                            borderColor: gadget.isForSale ? "rgb(77, 218, 98)" : "rgb(210, 65, 82)",
                        },
                        styles.gadgetStatusBtn
                    ]}
                    onPress={() => {
                        // Add to cart logic here
                    }}
                >
                    <Text style={styles.gadgetStatusTxt}>{gadget.isForSale ? "Đang kinh doanh" : "Ngừng kinh doanh"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        //TODO: handle call api patch
                    }}
                >
                    <Ionicons
                        name="checkbox"
                        size={55}
                        color="rgb(77, 218, 98)"
                    />
                </TouchableOpacity>
            </View >

            <ImageGalleryModal />
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
        width: width,
        height: width,
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
    },
    brandLogo: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    discountBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#ff4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        zIndex: 1,
    },
    discountBadgeText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    priceContainer: {
        marginBottom: 8,
    },
    originalPrice: {
        fontSize: 16,
        color: '#999',
        textDecorationLine: 'line-through',
        marginBottom: 4,
    },
    discountPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ff4444',
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
    soldOutWatermark: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: 15,
    },
    soldOutText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    productInfo: {
        padding: 16,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    productPrice: {
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
        width: width,
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 16,
        zIndex: 1,
        padding: 8,
    },
});