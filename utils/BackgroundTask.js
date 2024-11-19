import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
// import * as Notifications from 'expo-notifications';
import api from '../components/Authorization/api';
import { useNavigation } from '@react-navigation/native';

// Notifications.setNotificationHandler({
//     handleNotification: async () => ({
//         shouldShowAlert: true,
//         shouldPlaySound: false,
//         shouldSetBadge: false,
//         priority: Notifications.AndroidNotificationPriority.MAX
//     }),
// });

const BACKGROUND_FETCH_TASK = 'background-fetch';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    const response = await api.get("/notification/background");
    if (response.status == 200) {
        await schedulePushNotification(response.data);
    }

    // Be sure to return the successful result type!
    return BackgroundFetch.BackgroundFetchResult.NewData;
});

async function registerBackgroundFetchAsync() {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60 * 1, // 1 minute
        stopOnTerminate: false, // android only,
        startOnBoot: true, // android only
    });
}

async function unregisterBackgroundFetchAsync() {
    return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

async function schedulePushNotification(data) {
    // await Notifications.scheduleNotificationAsync({
    //     content: {
    //         title: data?.userName || "Test title",
    //         body: data?.content || "Test content",
    //         data: {
    //             notificationId: data?.id || 10,
    //             data: 'goes here',
    //             url: "techgadgets://BackgroundTask",
    //             test: {
    //                 test1: 'more data'

    //             }
    //         },
    //         priority: Notifications.AndroidNotificationPriority.MAX
    //     },
    //     trigger: {
    //         seconds: 2,
    //         channelId: 'new-emails',
    //     },
    // });
}

async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF237C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
    }
}

export default function BackgroundTask() {
    const navigation = useNavigation();
    const [isRegistered, setIsRegistered] = useState(false);
    const [status, setStatus] = useState(null);

    const [notification, setNotification] = useState(undefined);
    const notificationListener = useRef();
    const responseListener = useRef();

    // useEffect(() => {
    //     registerForPushNotificationsAsync();
    //     checkStatusAsync();

    //     notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
    //         setNotification(notification);
    //     });

    //     responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    //         console.log(response);
    //     });

    //     return () => {
    //         notificationListener.current &&
    //             Notifications.removeNotificationSubscription(notificationListener.current);
    //         responseListener.current &&
    //             Notifications.removeNotificationSubscription(responseListener.current);
    //     };
    // }, []);

    const checkStatusAsync = async () => {
        const status = await BackgroundFetch.getStatusAsync();
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
        setStatus(status);
        setIsRegistered(isRegistered);
    };

    const toggleFetchTask = async () => {
        if (isRegistered) {
            await unregisterBackgroundFetchAsync();
        } else {
            await registerBackgroundFetchAsync();
        }

        checkStatusAsync();
    };

    return (
        <View style={styles.screen}>
            <View style={styles.textContainer}>
                <Text>
                    Background fetch status:{' '}
                    <Text style={styles.boldText}>
                        {status && BackgroundFetch.BackgroundFetchStatus[status]}
                    </Text>
                </Text>
                <Text>
                    Background fetch task name:{' '}
                    <Text style={styles.boldText}>
                        {isRegistered ? BACKGROUND_FETCH_TASK : 'Not registered yet!'}
                    </Text>
                </Text>
            </View>
            <View style={styles.textContainer}></View>
            <Button
                title={isRegistered ? 'Unregister BackgroundFetch task' : 'Register BackgroundFetch task'}
                onPress={toggleFetchTask}
            />
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text>Title: {notification && notification.request.content.title} </Text>
                <Text>Body: {notification && notification.request.content.body}</Text>
                <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
            </View>
            <Button
                title="Press to schedule a notification"
                onPress={async () => {
                    await schedulePushNotification();
                }}
            />

            <Text
                style={{ fontWeight: "bold", fontSize: 15 }}
                onPress={() => navigation.goBack()}
            >
                back
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        margin: 10,
    },
    boldText: {
        fontWeight: 'bold',
    },
});