// src/components/TopProductsChart.jsx
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";
import {
    ArcElement,
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";


const VITE_API_URL = import.meta.env.VITE_API_URL;

ChartJS.register(  ArcElement,CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
export function TopProductsChart() {
    const [productos, setProductos] = useState([]);

     useEffect(() => {
    fetch(`${VITE_API_URL}/grafic`)
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error("Error al cargar los productos:", err));
  }, []);

    const data = {
        labels: productos.map((p) => p.name),
        datasets: [
            {
                label: "Precio (COL)",
                data: productos.map((p) => p.price),
                backgroundColor: "rgba(75, 192, 192, 0.5)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: "Top Productos por Precio",
            },
            legend: {
                position: "top",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
            <Bar data={data} options={options} />
        </div>
    );
}

export function TopRatingChart() {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        fetch(`${VITE_API_URL}/grafic/Rating`) // Asegúrate de que esta sea la URL correcta
            .then((res) => res.json())
            .then((data) => setProductos(data))
            .catch((err) => console.error("Error al cargar los productos:", err));
    }, []);

    const data = {
        labels: productos.map((p) => p.name),
        datasets: [
            {
                label: "rating ",
                data: productos.map((p) => p.rating),
                backgroundColor: "rgba(75, 192, 192, 0.5)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: "Top Productos por rating",
            },
            legend: {
                position: "top",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
            <Bar data={data} options={options} />
        </div>
    );

}
export function States() {
  const [stateCounts, setStateCounts] = useState({ activo: 0, inactivo: 0 });

  useEffect(() => {
    fetch(`${VITE_API_URL}/grafic/state`)
      .then((res) => res.json())
      .then((data) => {
        // Contar estados
        const counts = data.reduce(
          (acc, item) => {
            if (item.id_state === 1) acc.activo += 1;
            else if (item.id_state === 2) acc.inactivo += 1;
            return acc;
          },
          { activo: 0, inactivo: 0 }
        );
        setStateCounts(counts);
      })
      .catch((err) => console.error("Error al cargar los productos:", err));
  }, []);

  const data = {
    labels: ["Activos", "Inactivos"],
    datasets: [
      {
        label: "Estados",
        data: [stateCounts.activo, stateCounts.inactivo],
        backgroundColor: ["#36A2EB", "#FF6384"],
        borderColor: "#ffffff",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Distribución de Productos Activos/Inactivos",
      },
      legend: {
        position: "right",
      },
    },
  };

  return (
    <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
      <Pie data={data} options={options} />
    </div>
  );
}
