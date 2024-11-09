import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import React from "react";
import logo from "../../assets/adaptive-icon.png";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";

const Policy = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        style={styles.container}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        {/* TechGadget Logo */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            marginTop: 10,
          }}
        >
          <View
            style={{
              height: 43,
              width: 43,
              overflow: 'hidden',
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              style={{
                width: 48,
                height: 48,
              }}
              source={logo}
            />
          </View>
          <MaskedView
            maskElement={
              <Text
                style={{
                  backgroundColor: "transparent",
                  fontSize: 28,
                  fontWeight: "bold",
                }}
              >
                TechGadget
              </Text>
            }
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0.6, y: 0.6 }}
              colors={["#EDCD2B", "#EDCD2B", "rgba(0,0,0, 0.7)"]}
            >
              <Text style={{ opacity: 0, fontSize: 28, fontWeight: "bold" }}>
                TechGadget
              </Text>
            </LinearGradient>
          </MaskedView>
        </View>

        {/* Giới thiệu */}
        <View
          style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
        >
          <Icon name="users" type="font-awesome" color={"#ed8900"} />
          <Text
            style={{ fontWeight: "bold", fontSize: 18, marginVertical: 10 }}
          >
            GIỚI THIỆU
          </Text>
        </View>

        {/* Giới thiệu content */}
        <Text style={styles.paragraph}>
          Chào mừng bạn đến với nền tảng TechGadget (gọi riêng và gọi chung là, "TechGadget", "chúng tôi", hay "của chúng tôi"). TechGadget nghiêm túc thực hiện trách nhiệm của mình liên quan đến bảo mật thông tin theo các quy định về bảo vệ bí mật thông tin cá nhân của pháp luật Việt Nam và cam kết tôn trọng quyền riêng tư và sự quan tâm của tất cả người dùng đối với website và ứng dụng di động của chúng tôi.
        </Text>

        {/* KHI NÀO TechGadget SẼ THU THẬP DỮ LIỆU CÁ NHÂN? */}
        <View
          style={{
            flexDirection: "row",
            columnGap: 6,
            marginBottom: 10,
            marginTop: 16,
          }}
        >
          <Icon
            name="access-time"
            size={28}
            type="material"
            color={"#ed8900"}
          />
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              width: ScreenWidth * 0.8,
            }}
          >
            KHI NÀO TECHGADGET SẼ THU THẬP DỮ LIỆU CÁ NHÂN?
          </Text>
        </View>

        <Text style={styles.paragraph}>
          Chúng tôi sẽ/có thể thu thập dữ liệu cá nhân về bạn:
        </Text>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Khi bạn đăng ký và/hoặc sử dụng Các Dịch Vụ hoặc Nền tảng của chúng tôi, hoặc mở một tài khoản với chúng tôi
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Khi bạn gửi bất kỳ biểu mẫu nào, bao gồm đơn đăng ký hoặc các mẫu đơn khác liên quan đến bất kỳ sản phẩm và dịch vụ nào của chúng tôi, bằng hình thức trực tuyến hay dưới hình thức khác
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Khi bạn ký kết bất kỳ thỏa thuận nào hoặc cung cấp các tài liệu hoặc thông tin khác liên quan đến tương tác giữa bạn với chúng tôi, hoặc khi bạn sử dụng các sản phẩm và dịch vụ của chúng tôi
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Khi bạn tương tác với chúng tôi, chẳng hạn như thông qua các cuộc gọi điện thoại (có thể được ghi âm lại), thư từ, fax, gặp gỡ trực tiếp, các nền ứng dụng truyền thông xã hội và email
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Khi bạn sử dụng các dịch vụ điện tử của chúng tôi, hoặc tương tác với chúng tôi qua Nền tảng hoặc Trang Web hoặc Các Dịch Vụ của chúng tôi. Trường hợp này bao gồm thông qua tập tin cookie mà chúng tôi có thể triển khai khi bạn tương tác với các Nền tảng hoặc Trang Web của chúng tôi
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Khi bạn cấp quyền trên thiết bị của bạn để chia sẻ thông tin với ứng dụng hoặc Nền tảng của chúng tôi
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Khi bạn thực hiện các giao dịch thông qua Dịch vụ của chúng tôi chẳng hạn như mỗi khi bạn đặt mua hàng hoặc chấp nhận đơn đặt hàng của Người mua
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Khi bạn cung cấp ý kiến phản hồi hoặc gửi khiếu nại cho chúng tôi
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Khi bạn gửi dữ liệu cá nhân của bạn cho chúng tôi vì bất kỳ lý do gì
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Khi bạn thực hiện các hoạt động khác trên Nền tảng của chúng tôi
          </Text>
        </View>
        <Text style={styles.paragraph}>
          Các trường hợp trên không nhằm mục đích liệt kê đầy đủ các trường hợp và chỉ đưa ra một số trường hợp phổ biến về thời điểm dữ liệu cá nhân của bạn có thể bị thu thập.
        </Text>

        {/* TechGadget SẼ THU THẬP NHỮNG DỮ LIỆU GÌ? */}
        <View
          style={{
            flexDirection: "row",
            columnGap: 6,
            marginBottom: 10,
            marginTop: 16,
          }}
        >
          <Icon
            name="database-outline"
            size={28}
            type="material-community"
            color={"#ed8900"}
          />
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              width: ScreenWidth * 0.8,
            }}
          >
            TECHGADGET SẼ THU THẬP NHỮNG DỮ LIỆU GÌ?
          </Text>
        </View>
        <Text style={styles.paragraph}>
          Trừ trường hợp được quy định khác đi trong Chính sách này, dữ liệu cá nhân mà chúng tôi có thể thu thập bao gồm dữ liệu cá nhân cơ bản và dữ liệu cá nhân nhạy cảm (theo quy định của Luật riêng tư) như được liệt kê dưới đây:
        </Text>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>Họ tên</Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>Địa chỉ email</Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>Ngày sinh</Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Địa chỉ thanh toán và/hoặc giao nhận hàng hóa
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Tài khoản ngân hàng và thông tin thanh toán
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>Số điện thoại</Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>Giới tính</Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Thông tin được gửi bởi hoặc liên quan đến (các) thiết bị được sử dụng để truy cập vào Các Dịch vụ hoặc Nền tảng của chúng tôi
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Thông tin về mạng của bạn, bao gồm danh sách liên hệ của bạn khi đồng ý chia sẻ trên thiết bị của bạn, và những người và tài khoản mà bạn có tương tác
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Hình ảnh hoặc âm thanh hoặc video
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Thông tin về nhân thân được cấp bởi chính phủ hoặc các thông tin khác phục vụ cho các mục đích đánh giá pháp lý, nhận biết khách hàng, xác minh thông tin và/hoặc phòng chống gian lận của chúng tôi
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Dữ liệu truyền thông hoặc liên lạc, ví dụ như các tùy chọn nhận thông tin quảng cáo từ chúng tôi hoặc các bên thứ ba của bạn, tùy chọn phương tiện liên lạc và lịch sử thông tin liên lạc với chúng tôi, các nhà cung cấp dịch vụ của chúng tôi, và các bên thứ ba khác
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Thông tin sử dụng và giao dịch, bao gồm chi tiết về lịch sử tìm kiếm, giao dịch, quảng cáo và nội dung hiển thị mà tương tác với Nền Tảng, cũng như các sản phẩm và dịch vụ có liên quan của bạn
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>Dữ liệu về địa điểm</Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Bất kỳ thông tin nào khác về người dùng khi người dùng đăng nhập để sử dụng Các Dịch Vụ hoặc Nền tảng của chúng tôi, và khi người dùng sử dụng Các Dịch Vụ hoặc Nền tảng, cũng như thông tin về việc người dùng sử dụng Các Dịch Vụ hoặc Nền tảng của chúng tôi như thế nào
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            Dữ liệu tổng hợp về nội dung người dùng sử dụng
          </Text>
        </View>

        {/* COOKIES */}
        <View
          style={{
            flexDirection: "row",
            columnGap: 6,
            marginBottom: 10,
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <Icon name="cookie" size={28} type="material" color={"#ed8900"} />
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              width: ScreenWidth * 0.8,
            }}
          >
            COOKIES
          </Text>
        </View>

        <Text style={styles.paragraph}>
          Đôi khi chúng tôi hoặc các nhà cung cấp dịch vụ được cho phép và các đối tác quảng cáo của chúng tôi có thể sử dụng "cookie" hoặc các tính năng khác để cho phép chúng tôi hoặc các bên thứ ba thu thập hoặc chia sẻ thông tin liên quan đến việc sử dụng của bạn đối với Dịch vụ hoặc Nền tảng của chúng tôi. Các tính năng này sẽ giúp chúng tôi cải thiện Nền tảng và Các Dịch Vụ chúng tôi cung cấp, giúp chúng tôi đề xuất các dịch vụ và tính năng mới, và/hoặc cho phép chúng tôi và các đối tác quảng cáo của chúng tôi cung cấp các nội dung có liên quan hơn đến bạn. "Cookie" là các mã danh định được lưu trữ trên máy tính hoặc thiết bị di động của bạn lưu trữ các dữ liệu về máy tính hoặc thiết bị, bằng cách nào và khi nào Các Dịch Vụ hoặc Nền tảng được sử dụng hay truy cập, bởi bao nhiêu người và để theo dõi những hoạt động trong Các Nền tảng của chúng tôi. Chúng tôi có thể liên kết thông tin cookie với dữ liệu cá nhân. Cookie cũng liên kết với thông tin về những nội dung bạn đã chọn để mua sắm và các trang web mà bạn đã xem. Thông tin này được sử dụng để theo dõi giỏ hàng, để chuyển tải nội dung phù hợp với sở thích của bạn, để cho phép các đối tác cung cấp dịch vụ quảng  cáo cung cấp dịch vụ quảng cáo trên các trang thông qua mạng Internet và để thực hiện phân tích dữ liệu và hoặc theo dõi việc sử dụng Dịch vụ.
        </Text>

        {/* LOẠI TRỪ TRÁCH NHIỆM VỀ NGHĨA VỤ BẢO MẬT VÀ CÁC TRANG WEB BÊN THỨ BA */}
        <View
          style={{
            flexDirection: "row",
            columnGap: 6,
            marginBottom: 10,
            marginTop: 16,
          }}
        >
          <Icon
            name="alert-minus"
            size={28}
            type="material-community"
            color={"#ed8900"}
          />
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              width: ScreenWidth * 0.83,
            }}
          >
            LOẠI TRỪ TRÁCH NHIỆM VỀ NGHĨA VỤ BẢO MẬT VÀ CÁC TRANG WEB BÊN THỨ BA
          </Text>
        </View>

        <Text style={styles.paragraph}>
          <Text style={{ fontWeight: "500", color: "red" }}>
            CHÚNG TÔI KHÔNG ĐẢM BẢO TÍNH BẢO MẬT ĐỐI VỚI DỮ LIỆU CÁ NHÂN VÀ/HOẶC THÔNG TIN KHÁC MÀ BẠN CUNG CẤP TRÊN CÁC TRANG WEB CỦA BÊN THỨ BA.
          </Text>
          {"\u00A0"}Chúng tôi thực hiện các biện pháp bảo mật khác nhau để duy trì sự an toàn của dữ liệu cá nhân của bạn mà chúng tôi lưu giữ hoặc kiểm soát. Dữ liệu cá nhân của bạn được lưu đằng sau các mạng bảo mật và chỉ có thể được truy cập bởi một số cá nhân giới hạn có quyền truy cập đặc biệt đến các hệ thống của chúng tôi, và đã được yêu cầu bảo mật dữ liệu cá nhân đó. Khi bạn đặt hàng hoặc truy cập dữ liệu cá nhân của bạn, chúng tôi đề nghị sử dụng một máy chủ bảo mật. Tất cả dữ liệu cá nhân hoặc thông tin cá nhân bạn cung cấp sẽ được mã hóa vào các cơ sở dữ liệu của chúng tôi để chỉ được truy cập như mô tả bên trên.
        </Text>
        <View style={{ marginBottom: ScreenHeight / 15 }} />
        <View style={{
          width: ScreenWidth / 1.1,
          height: ScreenHeight / 10,
          alignItems: "flex-end",
          marginBottom: ScreenHeight / 35
        }}>
          <Text style={[styles.paragraph, { marginBottom: 0 }]}>
            Biên soạn: Tuấn Kiệt
          </Text>
          <Text style={[styles.paragraph, { marginBottom: 0 }]}>
            Hỗ trợ: Quang Kiệt
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 15,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 24,
    flex: 1,
  },
});

export default Policy;
