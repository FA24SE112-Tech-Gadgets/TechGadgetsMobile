import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import React, { useState } from "react";
import useAuth from "../../utils/useAuth";

const questions = [
  {
    id: "00EMXZ610H9M8",
    question: "Bạn có thích ăn rau mùi không?",
  },
  {
    id: "00EMXZ610H9E4",
    question: "Bạn có biết ăn cay không?",
  },
  {
    id: "00EMXZ610H9E1",
    question: "Bạn có thích ăn mặn không?",
  },
  {
    id: "00EMXZ610H9E0",
    question: "Bạn có thích ăn ngọt không?",
  },
  {
    id: "00EMXZ610H9E2",
    question: "Bạn có thích ăn chua không?",
  },
];

const CustomerFirstFilter = ({ navigation }) => {
  const [answers, setAnswers] = useState(
    new Array(questions.length).fill(null)
  );

  const handleAnswerChange = (index, answer) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer === answers[index] ? null : answer;
    setAnswers(newAnswers);
  };

  const { user } = useAuth();

  const handleSkip = () => {
    navigation.navigate("StackCustomerHome", { screen: "CustomerHome" });
  };

  const handleFinish = () => {
    navigation.navigate("StackCustomerHome", { screen: "CustomerHome" });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.container}>
        <Text style={styles.heading}>Câu hỏi cá nhân hoá</Text>
        <ScrollView
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          {questions.map((question, index) => (
            <View key={index} style={styles.questionContainer}>
              <Text style={styles.question}>{question.question}</Text>
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[
                    styles.button,
                    answers[index] === true && styles.selectedButton,
                  ]}
                  onPress={() => handleAnswerChange(index, true)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      answers[index] === true && styles.selectedButtonText,
                    ]}
                  >
                    Có
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.button,
                    answers[index] === false && styles.selectedButton,
                  ]}
                  onPress={() => handleAnswerChange(index, false)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      answers[index] === false && styles.selectedButtonText,
                    ]}
                  >
                    Không
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.bottomButtonContainer}>
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Bỏ qua</Text>
          </Pressable>
          <Pressable style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>Hoàn thành</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginVertical: 14,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  questionContainer: {
    marginBottom: 16,
  },
  question: {
    fontSize: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#FB6562",
    borderRadius: 4,
    width: "48%",
  },
  selectedButton: {
    backgroundColor: "#FB6562",
  },
  buttonText: {
    color: "#FB6562",
    fontWeight: "bold",
    textAlign: "center",
  },
  selectedButtonText: {
    color: "white",
  },
  bottomButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skipButton: {
    backgroundColor: "#B6A9A9",
    padding: 12,
    borderRadius: 4,
    width: "48%",
  },
  skipButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  finishButton: {
    backgroundColor: "#FB6562",
    padding: 12,
    borderRadius: 4,
    width: "48%",
  },
  finishButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default CustomerFirstFilter;
