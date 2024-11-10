import { useContext } from 'react';
import { NotificationContext } from '../components/Notification/NotificationContext';

function useNotification() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error('useNotification must be used within an NotificaitonProvider');
    }

    return context;
}

export default useNotification;
