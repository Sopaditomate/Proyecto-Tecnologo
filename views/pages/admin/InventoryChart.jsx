import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function InventoryChart({ order = "desc", title = "Stock Actual por Materia Prima" }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5001/api/inventario/")
            .then((res) => res.json())
            .then((info) => {
                // Ordenar de mayor a menor por cantidad
                const sortedInfo = [...info].sort((a, b) =>
                    order === "asc" ? a.CANTIDAD - b.CANTIDAD : b.CANTIDAD - a.CANTIDAD
                );

                const labels = sortedInfo.map((item) => item.MATERIA_PRIMA);
                const quantities = sortedInfo.map((item) => item.CANTIDAD);

                setData({
                    labels,
                    datasets: [
                        {
                            label: "Cantidad en Inventario",
                            data: quantities,
                            backgroundColor: "rgba(75, 192, 192, 0.6)",
                            borderColor: "rgba(75, 192, 192, 1)",
                            borderWidth: 1,
                        },
                    ],
                });
            })
            .catch((err) => console.error("Error al obtener datos:", err));
    }, []);

    if (!data) return <p>Cargando gráfico...</p>;

    return (
        <div style={{ width: "100%", maxWidth: "900px", margin: "auto", marginTop: "2rem" }}>
            <h3 style={{ textAlign: "center" }}>{title}</h3>
            <Bar data={data} options={{
                responsive: true,
                plugins: {
                    legend: { position: "top" },
                    tooltip: { mode: "index", intersect: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Cantidad"
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Materia Prima"
                        }
                    }
                }
            }} />
        </div>
    );
}
