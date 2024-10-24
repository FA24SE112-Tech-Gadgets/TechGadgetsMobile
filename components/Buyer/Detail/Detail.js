import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const Details = () => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Chi tiết sản phẩm</Text>

            {/* Cấu hình */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cấu hình</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>RAM</Text>
                    <Text style={styles.value}>8GB</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Chip</Text>
                    <Text style={styles.value}>Apple A18</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Pin</Text>
                    <Text style={styles.value}>Lithium-ion</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Công nghệ pin</Text>
                    <View style={styles.value}>
                        <Text>- Sạc không dây MagSafe lên đến 30W</Text>
                        <Text>- Sạc không dây Qi2 lên đến 15W</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Cổng sạc</Text>
                    <Text style={styles.value}>USB Type-C</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Loại sim</Text>
                    <Text style={styles.value}>SIM kép (nano-SIM và eSIM)</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Mạng di động</Text>
                    <Text style={styles.value}>GSM / CDMA / HSPA / EVDO / LTE / 5G</Text>
                </View>
            </View>

            {/* Camera */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Camera</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Camera sau</Text>
                    <Text style={styles.value}>48MP, 12MP</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Camera trước</Text>
                    <Text style={styles.value}>12MP</Text>
                </View>
            </View>

            {/* Kết nối */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Kết nối</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Wifi</Text>
                    <Text style={styles.value}>Wi-Fi 802.11 a/b/g/n/ac/6/7, dual-band, hotspot</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>GPS</Text>
                    <Text style={styles.value}>GPS, GLONASS, GALILEO, BEIDOU, QZSS</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Bluetooth</Text>
                    <Text style={styles.value}>Bluetooth 5.3</Text>
                </View>
            </View>

            {/* Thiết kế & trọng lượng */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thiết kế & trọng lượng</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Kích thước</Text>
                    <Text style={styles.value}>147.6 x 71.6 x 7.8 mm</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Khối lượng</Text>
                    <Text style={styles.value}>170g</Text>
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thiết kế & trọng lượng</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Kích thước</Text>
                    <Text style={styles.value}>147.6 x 71.6 x 7.8 mm</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Khối lượng</Text>
                    <Text style={styles.value}>170g</Text>
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thiết kế & trọng lượng</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Kích thước</Text>
                    <Text style={styles.value}>147.6 x 71.6 x 7.8 mm</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Khối lượng</Text>
                    <Text style={styles.value}>170g</Text>
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thiết kế & trọng lượng</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Kích thước</Text>
                    <Text style={styles.value}>147.6 x 71.6 x 7.8 mm</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Khối lượng</Text>
                    <Text style={styles.value}>170g</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 8,
    },
    label: {
        fontSize: 16,
    },
    value: {
        fontSize: 16,
        textAlign: 'right',
    },
});

export default Details;
