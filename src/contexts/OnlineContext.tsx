import { useState, useEffect } from 'react';
import {
    getIsOnline,
    checkOnlineStatus,
    subscribeNetwork
} from "../syncServices/network"

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState<boolean>(getIsOnline());

    useEffect(() => {
        checkOnlineStatus();
        return subscribeNetwork(setIsOnline);
    }, []);

    return isOnline;
}