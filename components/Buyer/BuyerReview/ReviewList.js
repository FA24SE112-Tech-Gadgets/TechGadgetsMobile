import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Modal from 'react-native-modal';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import api from '../../Authorization/api';
import ErrModal from '../../CustomComponents/ErrModal';
import LottieView from 'lottie-react-native';

const ReviewList = ({ route }) => {
    const { gadgetId } = route.params;

    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [isLoading, setIsLoading] = useState(false);

    const [sortOption, setSortOption] = useState('Ngày gần nhất');
    const [isModalVisible, setModalVisible] = useState(false);

    const navigation = useNavigation();

    const [stringErr, setStringErr] = useState('');
    const [isError, setIsError] = useState(false);

    const [isFetching, setIsFetching] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    // review pagination
    const fetchReviews = async (page) => {
        try {
            let url = `/reviews/gadget/${gadgetId}?Page=${page}&PageSize=10`;

            switch (sortOption) {
                case 'Ngày gần nhất':
                    url += '&SortByDate=DESC';
                    break;
                case 'Ngày xa nhất':
                    url += '&SortByDate=ASC';
                    break;
                case 'Cao đến thấp':
                    url += '&SortByRating=DESC';
                    break;
                case 'Thấp đến cao':
                    url += '&SortByRating=ASC';
                    break;
                case 'Tích cực':
                    url += '&IsPositive=true';
                    break;
                case 'Tiêu cực':
                    url += '&IsPositive=false';
                    break;
            }

            setIsFetching(true);
            const res = await api.get(url);
            setIsFetching(false);

            const newData = res.data.items;

            if (newData && newData.length > 0) {
                const allReviews = [
                    ...reviews,
                    ...newData.filter(
                        (newReview) =>
                            !reviews.some(
                                (existingReview) =>
                                    existingReview.id === newReview.id
                            )
                    ),
                ];
                setReviews(allReviews);
            }

            // Update hasMoreData status
            setHasMoreData(res.data.hasNextPage);
        } catch (error) {
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

    const renderReviewItem = ({ item }) => (
        <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <Image source={{ uri: item.customer.avatarUrl }} style={styles.avatar} />
                <View style={styles.reviewHeaderText}>
                    <Text style={styles.customerName}>{item.customer.fullName}</Text>
                    <View style={styles.ratingContainer}>
                        {Array(5).fill(0).map((_, i) => (
                            <AntDesign
                                key={i}
                                name={i < item.rating ? "star" : "staro"}
                                size={16}
                                color="#FFD700"
                            />
                        ))}
                    </View>
                </View>
                <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={styles.reviewContentContainer}>
                <Text style={styles.reviewContent}>{item.content}</Text>
                {item.isUpdated && <Text style={styles.updatedText}>Đã chỉnh sửa</Text>}
            </View>
            {item.sellerReply && (
                <View style={styles.sellerReply}>
                    <Text style={styles.sellerReplyHeader}>Người bán đã phản hồi:</Text>
                    <View style={styles.sellerReplyContentContainer}>
                        <Text style={styles.sellerReplyContent}>{item.sellerReply.content}</Text>
                        {item.sellerReply.isUpdated && <Text style={styles.updatedText}>Đã chỉnh sửa</Text>}
                    </View>
                </View>
            )}
        </View>
    );

    const handleScroll = () => {
        if (isFetching) return; // Ngăn không gọi nếu đang fetch

        if (hasMoreData) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage); // Cập nhật page nếu vẫn còn dữ liệu
            fetchReviews(nextPage); // Gọi fetchReviews với trang tiếp theo
        } else {
            setIsFetching(true);
            fetchReviews(currentPage); // Gọi fetchReviews nhưng không tăng currentPage
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchReviews(1); // Fetch new data (page 1)
        setRefreshing(false);
    };

    const renderFooter = () => {
        if (!isFetching) return null;
        return (
            <View style={{
                padding: 5,
                alignItems: 'center'
            }}>
                <ActivityIndicator color={"#ed8900"} />
            </View>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const handleSortOption = (option) => {
        if (option != sortOption) {
            setSortOption(option);
            setModalVisible(false);
            setReviews([]);
            setCurrentPage(1);
            const init = async () => {
                try {
                    setIsFetching(true);
                    let url = `/reviews/gadget/${gadgetId}?Page=1&PageSize=10`;

                    switch (option) {
                        case 'Ngày gần nhất':
                            url += '&SortByDate=DESC';
                            break;
                        case 'Ngày xa nhất':
                            url += '&SortByDate=ASC';
                            break;
                        case 'Cao đến thấp':
                            url += '&SortByRating=DESC';
                            break;
                        case 'Thấp đến cao':
                            url += '&SortByRating=ASC';
                            break;
                        case 'Tích cực':
                            url += '&IsPositive=true';
                            break;
                        case 'Tiêu cực':
                            url += '&IsPositive=false';
                            break;
                    }
                    const res = await api.get(url);
                    setIsFetching(false);
                    const newData = res.data.items;

                    if (newData && newData.length > 0) {
                        setReviews(newData);
                    }

                    if (!res.data.hasNextPage) {
                        setHasMoreData(false);
                    }

                } catch (error) {
                    setIsError(true);
                    setStringErr(
                        error.response?.data?.reasons[0]?.message ?
                            error.response.data.reasons[0].message
                            :
                            "Lỗi mạng vui lòng thử lại sau"
                    );
                    setIsFetching(false);
                }
            };

            init();
        }
    };

    //Reset to default state
    useFocusEffect(
        useCallback(() => {
            setReviews([]);
            setCurrentPage(1);
            setSortOption("Ngày gần nhất");
        }, [])
    );

    //For refresh page
    useFocusEffect(
        useCallback(() => {
            if (refreshing) {
                setReviews([]);
                setCurrentPage(1);
                fetchReviews(1);
                setRefreshing(false);
            }
        }, [refreshing])
    );

    // Initial Fetch when component mounts
    useFocusEffect(
        useCallback(() => {
            fetchReviews(1); // Fetch the first page
        }, [])
    );

    return (
        <LinearGradient colors={['#FFFFFF', '#fea92866']} style={styles.container}>
            {/* Header */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                padding: 16,
                borderWidth: 1,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                borderColor: 'rgb(254, 169, 40)',
                backgroundColor: 'rgba(254, 169, 40, 0.3)',
            }}>
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        padding: 8,
                        borderRadius: 20,
                        backgroundColor: "rgba(254, 161, 40, 0.5)",
                        borderWidth: 1,
                        borderColor: "rgb(254, 161, 40)",
                    }}
                >
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>

                <Text style={{
                    fontSize: 18,
                    fontWeight: "500"
                }}>Danh sách đánh giá</Text>
            </View>

            {/* Filter Sort */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, {
                        backgroundColor: isLoading ? "#cccccc" : "#ed8900",
                        borderColor: isLoading ? "#999999" : "#ed8900",
                    }]}
                    onPress={toggleModal}
                    disabled={isLoading}
                >
                    <Text style={styles.filterButtonText}>
                        {sortOption}
                    </Text>
                    <Icon
                        type="material-community"
                        name="chevron-down"
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            </View>

            <View
                style={{
                    height: ScreenHeight / 1.3,
                }}
            >
                {reviews.length === 0 ? (
                    <View
                        style={{
                            height: ScreenHeight / 1.7,
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
                                {isFetching ? "Đang tải đánh giá" : "Không có đánh giá nào"}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={{ marginBottom: 20, marginTop: 16 }}>
                        <FlatList
                            data={reviews}
                            keyExtractor={item => item.id}
                            renderItem={renderReviewItem}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            ListFooterComponent={renderFooter}
                            initialNumToRender={10}
                            showsVerticalScrollIndicator={false}
                            overScrollMode="never"
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                    </View>
                )}
            </View>

            <Modal
                isVisible={isModalVisible}
                onBackdropPress={toggleModal}
                onSwipeComplete={toggleModal}
                swipeDirection="down"
                style={styles.modal}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader} />
                    <View style={styles.modalOption}>
                        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Lọc theo</Text>
                    </View>
                    {['Ngày gần nhất', 'Ngày xa nhất', 'Cao đến thấp', 'Thấp đến cao', 'Tích cực', 'Tiêu cực'].map((option) => (
                        <Pressable
                            key={option}
                            style={styles.modalOption}
                            onPress={() => handleSortOption(option)}
                        >
                            <Text style={styles.modalOptionText}>{option}</Text>
                            {sortOption === option ? (
                                <Icon
                                    type="material-community"
                                    name="check-circle"
                                    size={24}
                                    color="#ed8900"
                                />
                            ) : (
                                <Icon
                                    type="material-community"
                                    name="checkbox-blank-circle-outline"
                                    size={24}
                                    color="#ed8900"
                                />
                            )}
                        </Pressable>
                    ))}
                </View>
            </Modal>

            <ErrModal
                stringErr={stringErr}
                isError={isError}
                setIsError={setIsError}
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 16,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 20,
    },
    filterButtonText: {
        color: 'white',
        fontWeight: '500',
        marginRight: 4,
        fontSize: 18,
    },
    reviewItem: {
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 8,
        marginHorizontal: 16,
        borderRadius: 8,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
    },
    reviewHeaderText: {
        flex: 1,
    },
    customerName: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
    },
    reviewDate: {
        color: '#666',
        fontSize: 12,
    },
    reviewContentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewContent: {
        flex: 1,
    },
    updatedText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginLeft: 8,
    },
    sellerReply: {
        backgroundColor: '#f0f0f0',
        padding: 8,
        borderRadius: 4,
    },
    sellerReplyHeader: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    sellerReplyContentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sellerReplyContent: {
        flex: 1,
        fontStyle: 'italic',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 32,
        color: '#666',
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        paddingVertical: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    modalHeader: {
        width: ScreenWidth / 7,
        height: ScreenHeight / 100,
        backgroundColor: "#ed8900",
        alignSelf: "center",
        marginBottom: 12,
        borderRadius: 30,
    },
    modalOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    modalOptionText: {
        fontSize: 16,
    },
});

export default ReviewList;