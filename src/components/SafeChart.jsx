import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { useRef, useEffect } from 'react';

export default function SafeChart({ type, data, options }) {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup to avoid canvas reuse
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return <Chart ref={chartRef} type={type} data={data} options={options} />;
}
