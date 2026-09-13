type Listner = (status:boolean) => void;

let isOnlineStatus = navigator.onLine
let listners :Listner[] = []

function updateStatus(status:boolean){
    if(status !== isOnlineStatus){
        isOnlineStatus = status;
        listners.forEach((listners) => listners(status))
    }
}

async function handleStatusChange(browserStatus:boolean){
    if(browserStatus)
        await checkOnlineStatus()
    else
        updateStatus(false)
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => handleStatusChange(true));
  window.addEventListener('offline', () => handleStatusChange(false));
}

export function getIsOnline() {
    return isOnlineStatus
}

export async function checkOnlineStatus (){
    if(!navigator.onLine){
        updateStatus(false)
        return false
    }

    try{
        const res = await fetch('http://localhost:8000/api/ping', {
            method:'HEAD',
            cache: 'no-store',
            signal: AbortSignal.timeout(8000),
        })
        const status = res.ok
        updateStatus(status)
        return status
    }catch{
        updateStatus(false)
        return false
    }
}

export const subscribeNetwork = (callback:Listner) => {
    listners.push(callback)
    return () => {
        listners.filter(l => l !== callback)
    }
}