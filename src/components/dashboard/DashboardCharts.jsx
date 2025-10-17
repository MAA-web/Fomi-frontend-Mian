'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  TimeSeriesScale
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  TimeSeriesScale
)

export default function DashboardCharts({ userStats, recentActivity }) {
  // Process data for charts
  const processChartData = () => {
    if (!recentActivity || recentActivity.length === 0) {
      return {
        dailyData: [],
        monthlyData: [],
        weeklyData: [],
        creditData: []
      }
    }

    // Group by date
    const dailyGroups = {}
    const monthlyGroups = {}
    const weeklyGroups = {}
    
    recentActivity.forEach(activity => {
      const date = new Date(activity.createdAt)
      const dayKey = date.toISOString().split('T')[0] // YYYY-MM-DD
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` // YYYY-MM
      const weekKey = getWeekKey(date)
      
      // Daily data
      if (!dailyGroups[dayKey]) {
        dailyGroups[dayKey] = { total: 0, images: 0, videos: 0, enhances: 0 }
      }
      dailyGroups[dayKey].total++
      if (activity.threadType === 'image') dailyGroups[dayKey].images++
      if (activity.threadType === 'video') dailyGroups[dayKey].videos++
      if (activity.threadType === 'enhance') dailyGroups[dayKey].enhances++
      
      // Monthly data
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = { total: 0, images: 0, videos: 0, enhances: 0 }
      }
      monthlyGroups[monthKey].total++
      if (activity.threadType === 'image') monthlyGroups[monthKey].images++
      if (activity.threadType === 'video') monthlyGroups[monthKey].videos++
      if (activity.threadType === 'enhance') monthlyGroups[monthKey].enhances++
      
      // Weekly data
      if (!weeklyGroups[weekKey]) {
        weeklyGroups[weekKey] = { total: 0, images: 0, videos: 0, enhances: 0 }
      }
      weeklyGroups[weekKey].total++
      if (activity.threadType === 'image') weeklyGroups[weekKey].images++
      if (activity.threadType === 'video') weeklyGroups[weekKey].videos++
      if (activity.threadType === 'enhance') weeklyGroups[weekKey].enhances++
    })

    return {
      dailyData: Object.entries(dailyGroups).sort(([a], [b]) => a.localeCompare(b)),
      monthlyData: Object.entries(monthlyGroups).sort(([a], [b]) => a.localeCompare(b)),
      weeklyData: Object.entries(weeklyGroups).sort(([a], [b]) => a.localeCompare(b)),
      creditData: [] // We'll need credit history data for this
    }
  }

  const getWeekKey = (date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    return startOfWeek.toISOString().split('T')[0]
  }

  const { dailyData, monthlyData, weeklyData } = processChartData()

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#C15F3C',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666'
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666'
        },
        beginAtZero: true
      }
    }
  }

  // Daily Generation Trends (Area Chart)
  const dailyChartData = {
    labels: dailyData.map(([date]) => new Date(date).toLocaleDateString()),
    datasets: [
      {
        label: 'Total Generations',
        data: dailyData.map(([, data]) => data.total),
        borderColor: '#C15F3C',
        backgroundColor: 'rgba(193, 95, 60, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#C15F3C',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'Images',
        data: dailyData.map(([, data]) => data.images),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: false,
        tension: 0.4
      },
      {
        label: 'Videos',
        data: dailyData.map(([, data]) => data.videos),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        fill: false,
        tension: 0.4
      },
      {
        label: 'Enhancements',
        data: dailyData.map(([, data]) => data.enhances),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        fill: false,
        tension: 0.4
      }
    ]
  }

  // Monthly Usage Patterns (Bar Chart)
  const monthlyChartData = {
    labels: monthlyData.map(([month]) => {
      const [year, monthNum] = month.split('-')
      return new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }),
    datasets: [
      {
        label: 'Images',
        data: monthlyData.map(([, data]) => data.images),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10B981',
        borderWidth: 1
      },
      {
        label: 'Videos',
        data: monthlyData.map(([, data]) => data.videos),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#EF4444',
        borderWidth: 1
      },
      {
        label: 'Enhancements',
        data: monthlyData.map(([, data]) => data.enhances),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: '#8B5CF6',
        borderWidth: 1
      }
    ]
  }

  return (
    <div className="space-y-8">
      {/* Daily Generation Trends */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Generation Trends</h3>
        <div className="h-80">
          <Line data={dailyChartData} options={chartOptions} />
        </div>
      </div>

      {/* Monthly Usage Patterns */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Usage Patterns</h3>
        <div className="h-80">
          <Bar data={monthlyChartData} options={chartOptions} />
        </div>
      </div>

      {/* Weekly Activity Heatmap - Simple version for now */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Activity Heatmap</h3>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-sm">Calendar heatmap coming soon</p>
            <p className="text-xs text-gray-400 mt-1">Weekly activity visualization</p>
          </div>
        </div>
      </div>

      {/* Credit Usage Over Time - Placeholder */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Credit Usage Over Time</h3>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <p className="text-sm">Credit usage tracking coming soon</p>
            <p className="text-xs text-gray-400 mt-1">Historical credit consumption</p>
          </div>
        </div>
      </div>
    </div>
  )
}

