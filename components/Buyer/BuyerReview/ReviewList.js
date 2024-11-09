import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Modal from 'react-native-modal';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import api from '../../Authorization/api';

const ReviewList = ({ route }) => {
    const { gadgetId } = route.params;
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [sortOption, setSortOption] = useState('Ngày gần nhất');
    const [isModalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();

    const fetchReviews = useCallback(async (refresh = false) => {
        if (isLoading || (!hasNextPage && !refresh)) return;

        setIsLoading(true);
        try {
            let url = `/reviews/gadget/${gadgetId}?Page=${refresh ? 1 : page}&PageSize=10`;

            switch(sortOption) {
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

            const response = await api.get(url);
            const newReviews = response.data.items;
            setReviews(refresh ? newReviews : [...reviews, ...newReviews]);
            setHasNextPage(response.data.hasNextPage);
            setPage(refresh ? 2 : page + 1);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    }, [gadgetId, isLoading, hasNextPage, page, reviews, sortOption]);

    useFocusEffect(
        useCallback(() => {
            fetchReviews(true);
        }, [fetchReviews])
    );

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const handleSortOption = (option) => {
        setSortOption(option);
        setModalVisible(false);
        fetchReviews(true);
    };

    return (
        <LinearGradient colors={['#FFFFFF', '#fea92866']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTxt}>Danh sách đánh giá</Text>
            </View>
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={toggleModal}
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
            <FlatList
                data={reviews}
                renderItem={renderReviewItem}
                keyExtractor={(item) => item.id}
                onEndReached={() => fetchReviews()}
                onEndReachedThreshold={0.1}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Không có đánh giá nào.</Text>
                }
            />
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
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        borderColor: 'rgb(254, 169, 40)',
        backgroundColor: 'rgba(254, 169, 40, 0.3)',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: "rgba(254, 161, 40, 0.5)",
        borderWidth: 1,
        borderColor: "rgb(254, 161, 40)",
    },
    headerTxt: {
        fontSize: 18,
        fontWeight: "500"
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#fea128',
        borderRadius: 20,
    },
    filterButtonText: {
        color: 'white',
        fontWeight: '500',
        marginRight: 4,
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