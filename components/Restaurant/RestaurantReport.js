import { View, Text, Dimensions, Pressable, ScrollView } from 'react-native'
import React, { useState } from 'react'
import PieChart from 'react-native-pie-chart'
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const dishArr = [
    {
        id: 0,
        name: "Phở Bò 2 Trứng",
        numOfRating: 20,
        ratingAve: 4.5
    },
    {
        id: 1,
        name: "Phở Bò Gầu Gân",
        numOfRating: 25,
        ratingAve: 4
    },
    {
        id: 2,
        name: "Cơm Chiên Cá Mặn",
        numOfRating: 2,
        ratingAve: 3.9
    },
    {
        id: 3,
        name: "Bún Bò Gầu Gân",
        numOfRating: 34,
        ratingAve: 4.7
    },
    {
        id: 4,
        name: "Hủ Tiếu Xương",
        numOfRating: 27,
        ratingAve: 4.9
    },
    {
        id: 5,
        name: "Bánh Mì Bò Kho",
        numOfRating: 14,
        ratingAve: 2.6
    },
    {
        id: 6,
        name: "Hủ Tiếu Mì Hoành Thánh",
        numOfRating: 199,
        ratingAve: 4.2
    },
    {
        id: 7,
        name: "Cơm Văn Phòng",
        numOfRating: 27,
        ratingAve: 5
    },
    {
        id: 8,
        name: "Phở Bò 2 Trứng",
        numOfRating: 20,
        ratingAve: 4.5
    },
    {
        id: 9,
        name: "Phở Bò Gầu Gân",
        numOfRating: 25,
        ratingAve: 4
    },
    {
        id: 10,
        name: "Cơm Chiên Cá Mặn",
        numOfRating: 2,
        ratingAve: 3.9
    },
    {
        id: 11,
        name: "Bún Bò Gầu Gân",
        numOfRating: 34,
        ratingAve: 4.7
    },
    {
        id: 12,
        name: "Hủ Tiếu Xương",
        numOfRating: 27,
        ratingAve: 4.9
    },
    {
        id: 13,
        name: "Bánh Mì Bò Kho",
        numOfRating: 14,
        ratingAve: 2.6
    },
    {
        id: 14,
        name: "Hủ Tiếu Mì Hoành Thánh",
        numOfRating: 199,
        ratingAve: 4.2
    },
    {
        id: 15,
        name: "Cơm Văn Phòng",
        numOfRating: 27,
        ratingAve: 5
    },
    {
        id: 16,
        name: "Phở Bò 2 Trứng",
        numOfRating: 20,
        ratingAve: 4.5
    },
    {
        id: 17,
        name: "Phở Bò Gầu Gân",
        numOfRating: 25,
        ratingAve: 4
    },
    {
        id: 18,
        name: "Cơm Chiên Cá Mặn",
        numOfRating: 2,
        ratingAve: 3.9
    },
    {
        id: 19,
        name: "Bún Bò Gầu Gân",
        numOfRating: 34,
        ratingAve: 4.7
    },
    {
        id: 20,
        name: "Hủ Tiếu Xương",
        numOfRating: 27,
        ratingAve: 4.9
    },
    {
        id: 21,
        name: "Bánh Mì Bò Kho",
        numOfRating: 14,
        ratingAve: 2.6
    },
    {
        id: 22,
        name: "Hủ Tiếu Mì",
        numOfRating: 19,
        ratingAve: 4.2
    },
    {
        id: 23,
        name: "Mì Gà Hải Nam",
        numOfRating: 27,
        ratingAve: 5
    },
    {
        id: 24,
        name: "ABC",
        numOfRating: 27,
        ratingAve: 5
    },
]

export default function RestaurantReport() {
    const screenHeight = Dimensions.get("window").height;
    const screenWidth = Dimensions.get("window").width;

    // Pie chart
    const widthAndHeight = screenWidth / 2.5
    const [series, setSeries] = useState([30, 70]);
    const sliceColor = ['#FFC100', '#FB6562',];

    const [isChoosed, setChoosed] = useState(0);

    const [selectedDish, setSelectedDish] = useState(0); //store dish id
    const [dishData, setDishData] = useState(dishArr);

    return (
        <>
            {/* Pie chart */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginHorizontal: screenWidth / 23,
                marginTop: screenHeight / 25
            }}>
                <View style={{
                    position: "relative"
                }}>
                    <PieChart
                        widthAndHeight={widthAndHeight}
                        series={series}
                        sliceColor={sliceColor}
                        coverRadius={0.9}
                        coverFill={'#FFF'}
                    />
                    <View style={{
                        position: "absolute",
                        top: screenWidth / 8,
                        left: screenWidth / 15,
                    }}>
                        <Text style={{
                            fontWeight: "500",
                            fontSize: screenWidth / 15
                        }}>100 lượt</Text>
                        <Text style={{
                            fontSize: screenWidth / 25
                        }}>Tổng lượt ấn</Text>
                    </View>
                </View>
                <View>
                    <View style={{
                        borderLeftWidth: 3,
                        borderLeftColor: "#FFC100",
                        paddingLeft: screenWidth / 25
                    }}>
                        <Text>Món của quán: ({series[0]}%)</Text>
                        <Text>30 lượt</Text>
                    </View>
                    <View style={{
                        borderLeftWidth: 3,
                        borderLeftColor: "#FB6562",
                        paddingLeft: screenWidth / 25
                    }}>
                        <Text>Món của quán: ({series[1]}%)</Text>
                        <Text>70 lượt</Text>
                    </View>
                </View>
            </View>

            {/* Filter */}
            <View style={{
                alignItems: "center"
            }}>
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: screenHeight / 30,
                    height: screenHeight / 20,
                    width: screenWidth / 1.1,
                    alignItems: "center",
                    borderRadius: 30,
                }}>
                    {/* 3 Tháng */}
                    <Pressable style={{
                        justifyContent: "center",
                        backgroundColor: isChoosed === 0 ? "#FB6562" : null,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        height: screenHeight / 20,
                        width: (screenWidth / 1.1) / 4,
                        borderRadius: 30,
                        borderWidth: isChoosed === 0 ? 0 : 1,
                        borderColor: "#FB6562",
                        alignItems: "center"
                    }}
                        onPress={() => setChoosed(0)}
                    >
                        <Text style={{
                            color: isChoosed === 0 ? "white" : "black"
                        }}
                        >3 Tháng</Text>
                    </Pressable>

                    {/* 6 Tháng */}
                    <Pressable style={{
                        justifyContent: "center",
                        backgroundColor: isChoosed === 1 ? "#FB6562" : null,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        height: screenHeight / 20,
                        width: (screenWidth / 1.1) / 4,
                        borderRadius: 30,
                        borderWidth: isChoosed === 1 ? 0 : 1,
                        borderColor: "#FB6562",
                        alignItems: "center"
                    }}
                        onPress={() => setChoosed(1)}
                    >
                        <Text style={{
                            color: isChoosed === 1 ? "white" : "black"
                        }}
                        >6 Tháng</Text>
                    </Pressable>

                    {/* 9 Tháng */}
                    <Pressable style={{
                        justifyContent: "center",
                        backgroundColor: isChoosed === 2 ? "#FB6562" : null,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        height: screenHeight / 20,
                        width: (screenWidth / 1.1) / 4,
                        borderRadius: 30,
                        borderWidth: isChoosed === 2 ? 0 : 1,
                        borderColor: "#FB6562",
                        alignItems: "center"
                    }}
                        onPress={() => setChoosed(2)}
                    >
                        <Text style={{
                            color: isChoosed === 2 ? "white" : "black"
                        }}
                        >9 Tháng</Text>
                    </Pressable>

                    {/* 1 Năm */}
                    <Pressable style={{
                        justifyContent: "center",
                        backgroundColor: isChoosed === 3 ? "#FB6562" : null,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        height: screenHeight / 20,
                        width: (screenWidth / 1.1) / 4,
                        borderRadius: 30,
                        borderWidth: isChoosed === 3 ? 0 : 1,
                        borderColor: "#FB6562",
                        alignItems: "center"
                    }}
                        onPress={() => setChoosed(3)}
                    >
                        <Text style={{
                            color: isChoosed === 3 ? "white" : "black"
                        }}
                        >1 Năm</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView
                overScrollMode="never"
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={{
                        alignItems: "center",
                        marginTop: screenHeight / 25,
                    }}
                >
                    {
                        dishData.length !== 0 && dishData?.map((item, index) => (
                            <Pressable
                                key={item.id}
                                onPress={() => {
                                    setSelectedDish(item.id)
                                }}
                            >
                                <CustomDish selectedDish={selectedDish} dishItem={item} />
                            </Pressable>
                        ))
                    }
                </View>
            </ScrollView>
        </>
    )
}

const CustomDish = ({ selectedDish, dishItem }) => {
    const screenHeight = Dimensions.get("window").height;
    const screenWidth = Dimensions.get("window").width;

    return (
        <View
            style={{
                backgroundColor: selectedDish === dishItem.id ? "#C40C0C" : null,
                width: screenWidth / 1.5,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: screenWidth / 30,
                paddingVertical: screenHeight / 100,
                borderRadius: 30
            }}
        >
            <View style={{
                width: screenWidth / 3,
            }}>
                <Text style={{
                    color: selectedDish === dishItem.id ? "white" : "black"
                }}>{dishItem.name}</Text>
            </View>
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                width: screenWidth / 4,
            }}>
                <MaterialCommunityIcons name="star" size={24} color="#FFC700" />
                <Text style={{
                    color: selectedDish === dishItem.id ? "white" : "black"
                }}>{dishItem.ratingAve}</Text>
                <Text style={{
                    color: selectedDish === dishItem.id ? "white" : "black"
                }}>({dishItem.numOfRating})</Text>
            </View>
        </View>
    );
};
