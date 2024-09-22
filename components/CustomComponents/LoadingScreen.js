import { View } from 'react-native';
import LottieView from 'lottie-react-native';

const LoadingScreen = () => {
	return (
		<View style={{ flex: 1 }}>
			<LottieView
				source={require('../../assets/animations/loadingScreen.json')}
				style={{ width: '100%', height: '100%', position: 'absolute' }}
				autoPlay
				loop
				speed={0.8}
			/>
		</View>
	);
};

export default LoadingScreen;
