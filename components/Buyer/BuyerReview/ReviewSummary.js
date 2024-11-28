import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../Authorization/api';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { ScreenHeight, ScreenWidth } from '@rneui/base';

const ReviewSummary = ({ gadgetId, navigation, setStringErr, setIsError }) => {
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchReviewSummary();
        }, [])
    );

    const fetchReviewSummary = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/reviews/summary/gadgets/${gadgetId}`);
            setSummary(response.data);
        } catch (error) {
            console.log('Error fetching review summary:', error);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const decimalPart = rating - fullStars;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<AntDesign key={i} name="star" size={16} color="#FFD700" />);
            } else if (i === fullStars + 1 && decimalPart > 0) {
                stars.push(
                    <View key={i} style={styles.starContainer}>
                        <AntDesign name="star" size={16} color="#FFD700" style={[styles.starOverlay, { width: `${decimalPart * 100}%` }]} />
                        <AntDesign name="staro" size={16} color="#FFD700" style={styles.starUnderlay} />
                    </View>
                );
            } else {
                stars.push(<AntDesign key={i} name="staro" size={16} color="#FFD700" />);
            }
        }

        return stars;
    };

    const getBarWidth = (starCount) => {
        if (summary.numOfReview === 0) return 0;
        return (starCount / summary.numOfReview) * 100;
    };

    const renderBar = (starCount, label) => {
        const barWidth = getBarWidth(starCount);
        const barColor = starCount > 0 ? '#ed8900' : '#e0e0e0';
        return (
            <View style={styles.barRow}>
                <View style={{
                    flexDirection: "row",
                    gap: 5,
                    width: 50
                }}>
                    <Text>{label}</Text>
                    <AntDesign name="star" size={16} color="#FFD700" />
                </View>
                <View style={styles.barBackground}>
                    <View
                        style={[
                            styles.barFill,
                            {
                                width: `${barWidth}%`,
                                backgroundColor: barColor
                            }
                        ]}
                    />
                </View>
                <Text style={styles.barCount}>{starCount}</Text>
            </View>
        );
    };

    if (isLoading) {
        return (
            <LinearGradient colors={['#fea92866', '#FFFFFF']} style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                    <LottieView
                        source={require("../../../assets/animations/catRole.json")}
                        style={styles.lottieAnimation}
                        autoPlay
                        loop
                        speed={0.8}
                    />
                    <Text style={styles.loadingText}>Đang load dữ liệu</Text>
                </View>
            </LinearGradient>
        );
    }

    if (!summary || summary.numOfReview === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.noReviewText}>Sản phẩm này hiện chưa có lượt đánh giá nào!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Đánh giá sản phẩm</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ReviewList', { gadgetId })}
                    style={styles.viewAllButton}
                >
                    <Text style={styles.viewAllText}>Xem tất cả đánh giá</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.ratingContainer}>
                <Text style={styles.averageRating}>{summary.avgReview.toFixed(1)}</Text>
                <View style={styles.starsContainer}>
                    {renderStars(summary.avgReview)}
                </View>
                <Text style={styles.totalReviews}>({summary.numOfReview} đánh giá)</Text>
            </View>
            <View style={styles.barContainer}>
                {renderBar(summary.numOfFiveStar, "5")}
                {renderBar(summary.numOfFourStar, "4")}
                {renderBar(summary.numOfThreeStar, "3")}
                {renderBar(summary.numOfTwoStar, "2")}
                {renderBar(summary.numOfOneStar, "1")}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 16,
        marginTop: 16,
        borderRadius: 8,
    },
    loadingContainer: {
        flex: 1,
        height: ScreenHeight / 2.5,
    },
    loadingContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    lottieAnimation: {
        width: ScreenWidth,
        height: ScreenWidth / 2.5,
    },
    loadingText: {
        fontSize: 18,
        width: ScreenWidth / 2.5,
        textAlign: "center",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewAllButton: {
        padding: 8,
    },
    viewAllText: {
        color: '#ed8900',
        fontWeight: '500',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    averageRating: {
        fontSize: 32,
        fontWeight: 'bold',
        marginRight: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    starContainer: {
        position: 'relative',
        width: 16,
        height: 16,
    },
    starOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
    },
    starUnderlay: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    totalReviews: {
        color: '#666',
    },
    barContainer: {
        marginTop: 8,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    barBackground: {
        flex: 1,
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        marginHorizontal: 8,
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
    barCount: {
        width: 30,
        textAlign: 'right',
    },
    noReviewText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 16,
    },
});

export default ReviewSummary;