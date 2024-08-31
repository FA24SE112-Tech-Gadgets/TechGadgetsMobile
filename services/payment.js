import { VIETQR_URL } from "@env";
import axios from "axios";
import api from "../components/Authorization/api";
export async function createPaymentLink(type, accountRole) {
    try {
        // let res = await axios({
        //     method: "POST",
        //     url: serverURL + accountRole === "user" ? `/subscriptions/users` : `/subscriptions/restaurants`,
        //     data: {
        //         type: type
        //     },
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        // });
        const res = await api.post(accountRole === "user" ? `/subscriptions/users` : `/subscriptions/restaurants`,
            {
                type: type
            }
        )
        return res.data;
    } catch (error) {
        return error.response.data;
    }
}

// export async function getOrder(orderId) {
//     try {
//         let res = await axios({
//             method: "GET",
//             url: `${SERVER_URL}/order/${orderId}`,
//             headers: {
//                 "Content-Type": "application/json",
//             },
//         });
//         return res.data;
//     } catch (error) {
//         return error.response.data;
//     }
// }

export async function getBanksList() {
    try {
        let res = await axios({
            method: "GET",
            url: VIETQR_URL,
            headers: {
                "Content-Type": "application/json",
            },
        });
        return res.data;
    } catch (error) {
        return error.response.data;
    }
}