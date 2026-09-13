import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";


function PriceChart({ data }) {

    const chartData = data.map(item => ({
        date: item.date.substring(0, 10),
        price: item.close
    }));


    return (

        <ResponsiveContainer
            width="100%"
            height={300}
        >

            <LineChart data={chartData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis />

                <Tooltip />

                <Line
                    type="monotone"
                    dataKey="price"
                    strokeWidth={2}
                />

            </LineChart>

        </ResponsiveContainer>

    );
}


export default PriceChart;