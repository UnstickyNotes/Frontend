import type { Response } from "../types";

// export const response = (stattus:boolean, message:string ,data:Array<object> | object | null = null) => {
//     const res:Response<typeof data> = {
//         status:stattus,
//         message:message ?? '',
//         data:data
//     }
//     return res
// }

export const response = <T>(status: boolean, message: string, data: T | null = null): Response< T | null> => {
  return {
    status,
    message: message ?? '',
    data
  }
}