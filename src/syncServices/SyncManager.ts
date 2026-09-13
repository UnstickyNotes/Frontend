import { useState, useEffect } from 'react';
import {
    getIsOnline,
    checkOnlineStatus,
    subscribeNetwork
} from "./network"

export const isOnline = async() => {

    const [ isOnline, setIsOnline ] = useState<boolean>(getIsOnline());
    
    useEffect(() => {
        checkOnlineStatus()
        return subscribeNetwork(setIsOnline)
    }, []);

    return isOnline
}
