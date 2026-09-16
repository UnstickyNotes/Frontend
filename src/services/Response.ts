import type { Response } from "../types";

export const response = (stattus:boolean, message:string ,data:Array<Record<string, any>> | Record<string, any> | null = null) => {
    const res:Response<typeof data> = {
        status:stattus,
        message:message ?? '',
        data:data
    }
    return res
}