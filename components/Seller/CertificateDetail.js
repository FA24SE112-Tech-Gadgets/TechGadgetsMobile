import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
// import { X } from 'react-native-vector-icons/Ionicons'; // Use your preferred icon library
// import { User, Briefcase, Phone, Mail, FileText } from 'react-native-vector-icons/Ionicons'; // Use appropriate icons from your library

const CertificateDetail = ({ application, onClose }) => {
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      Pending: { backgroundColor: '#FFEB3B', color: '#F57F20' }, // Yellow
      Approved: { backgroundColor: '#4CAF50', color: '#FFFFFF' }, // Green
      Rejected: { backgroundColor: '#F44336', color: '#FFFFFF' }, // Red
    };
    const currentStatusStyle = statusStyles[status] || { backgroundColor: 'gray', color: '#FFFFFF' };

    return (
      <View style={[styles.statusContainer, { backgroundColor: currentStatusStyle.backgroundColor }]}>
        <Text style={[styles.statusText, { color: currentStatusStyle.color }]}>
          {status === 'Pending' ? 'Đang Chờ' : status === 'Approved' ? 'Đã Duyệt' : 'Bị Từ Chối'}
        </Text>
      </View>
    );
  };

  const businessModelTranslation = {
    BusinessHousehold: 'Hộ Kinh Doanh',
    Personal: 'Cá Nhân',
    Company: 'Công Ty',
  };

  return (
    <View style={styles.container}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Chi Tiết Đơn Đăng Ký</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            {/* <X style={styles.closeIcon} /> */}<Text>X</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalContent}>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              {/* <User style={styles.sectionIcon} /> */}
              <Text style={styles.sectionTitle}>Thông Tin Cửa Hàng</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>Tên Cửa Hàng: {application.shopName}</Text>
              <Text style={styles.sectionText}>Địa Chỉ Cửa Hàng: {application.shopAddress}</Text>
            </View>
          </View>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              {/* <Briefcase style={styles.sectionIcon} /> */}
              <Text style={styles.sectionTitle}>Thông Tin Doanh Nghiệp</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>Mô Hình Kinh Doanh: {businessModelTranslation[application.businessModel] || application.businessModel}</Text>
              {application.companyName && <Text style={styles.sectionText}>Tên Công Ty: {application.companyName}</Text>}
              <Text style={styles.sectionText}>Mã Số Thuế: {application.taxCode}</Text>
            </View>
          </View>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              {/* <Phone style={styles.sectionIcon} /> */}
              <Text style={styles.sectionTitle}>Thông Tin Liên Hệ</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>Số Điện Thoại: {application.phoneNumber}</Text>
              {application.billingMailApplications.length > 0 && (
                <View>
                  <Text style={styles.sectionText}>Email Thanh Toán:</Text>
                  {application.billingMailApplications.map((email, index) => (
                    <View key={index} style={styles.emailContainer}>
                      {/* <Mail style={styles.emailIcon} /> */}
                      <Text style={styles.emailText}>{email.mail}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              {/* <FileText style={styles.sectionIcon} /> */}
              <Text style={styles.sectionTitle}>Trạng Thái Đơn Đăng Ký</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>Trạng Thái: </Text>
                <StatusBadge status={application.status} />
              </View>
              <Text style={styles.sectionText}>Ngày Tạo: {new Date(application.createdAt).toLocaleString()}</Text>
              {application.rejectReason && <Text style={styles.sectionText}>Lý Do Từ Chối: {application.rejectReason}</Text>}
            </View>
          </View>
          {application.businessRegistrationCertificateUrl && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                {/* <FileText style={styles.sectionIcon} /> */}
                <Text style={styles.sectionTitle}>Giấy Đăng Ký Kinh Doanh</Text>
              </View>
              <View style={styles.sectionContent}>
                <Image
                  source={{ uri: application.businessRegistrationCertificateUrl }}
                  style={styles.image}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    fontSize: 24,
    color: 'gray',
  },
  modalContent: {
    marginTop: 20,
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionIcon: {
    marginRight: 10,
    fontSize: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionContent: {
    paddingLeft: 30,
  },
  sectionText: {
    fontSize: 14,
    marginBottom: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    padding: 5,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    marginRight: 10,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailIcon: {
    marginRight: 10,
  },
  emailText: {
    fontSize: 14,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    borderRadius: 5,
    marginTop: 10,
  },
});

export default CertificateDetail;
