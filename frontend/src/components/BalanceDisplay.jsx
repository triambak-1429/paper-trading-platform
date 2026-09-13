import { useEffect, useState } from "react";

function BalanceDisplay() {

    const [balance, setBalance] =
        useState(null);


    async function loadBalance() {

        const token =
            localStorage.getItem("access_token");

        if (!token) return;


        try {

            const response =
                await fetch(
                    `${API_URL}/users/me`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            if (!response.ok) return;

            const data =
                await response.json();

            setBalance(data.balance);

        } catch (error) {

            console.error(error);

        }

    }


    useEffect(() => {

        loadBalance();

    }, []);


    if (balance === null) {
        return null;
    }


    return (

        <div className="balance-display">

            <span>
                Virtual Balance
            </span>

            <strong>
                ₹
                {balance.toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 2
                    }
                )}
            </strong>

        </div>

    );

}

export default BalanceDisplay;