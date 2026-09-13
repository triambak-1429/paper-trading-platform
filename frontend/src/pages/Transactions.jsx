import { useEffect, useState } from "react";
import { getTransactions } from "../services/api";

function Transactions() {

    const [transactions, setTransactions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    async function loadTransactions() {

        try {

            setLoading(true);
            setError("");

            const data =
                await getTransactions();

            setTransactions(data);

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "Could not load transactions"
            );

        } finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        loadTransactions();

    }, []);


    if (loading) {

        return (
            <div className="page-container">

                <div className="loading">
                    Loading transactions...
                </div>

            </div>
        );

    }


    if (error) {

        return (
            <div className="page-container">

                <div className="error-box">

                    <h2>
                        Could not load transactions
                    </h2>

                    <p>{error}</p>

                    <button
                        className="primary-button"
                        onClick={loadTransactions}
                    >
                        Retry
                    </button>

                </div>

            </div>
        );

    }


    return (

        <div className="page-container">

            <div className="page-header">

                <div>

                    <h1>
                        Transaction History
                    </h1>

                    <p>
                        View your simulated
                        trading activity.
                    </p>

                </div>

            </div>


            {transactions.length === 0 ? (

                <div className="empty-state">

                    <h3>
                        No transactions yet
                    </h3>

                    <p>
                        Your buy and sell
                        transactions will appear here.
                    </p>

                </div>

            ) : (

                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Asset
                                </th>

                                <th>
                                    Type
                                </th>

                                <th>
                                    Quantity
                                </th>

                                <th>
                                    Price
                                </th>

                                <th>
                                    Total
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {transactions.map(
                                (transaction) => {

                                    const date =
                                        new Date(
                                            transaction.created_at
                                        );

                                    return (

                                        <tr
                                            key={
                                                transaction.id
                                            }
                                        >

                                            <td>
                                                {date.toLocaleString()}
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        transaction.symbol
                                                    }
                                                </strong>
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        transaction.transaction_type ===
                                                        "BUY"
                                                            ? "transaction-buy"
                                                            : "transaction-sell"
                                                    }
                                                >
                                                    {
                                                        transaction.transaction_type
                                                    }
                                                </span>

                                            </td>

                                            <td>
                                                {
                                                    transaction.quantity
                                                }
                                            </td>

                                            <td>
                                                ₹
                                                {transaction.price.toFixed(2)}
                                            </td>

                                            <td>
                                                ₹
                                                {transaction.total_amount.toFixed(2)}
                                            </td>

                                        </tr>

                                    );

                                }
                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}

export default Transactions;