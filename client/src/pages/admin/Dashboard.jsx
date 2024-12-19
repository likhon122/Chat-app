import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

// Sample data
const lineData = [
  { name: "Jan", messages: 400 },
  { name: "Feb", messages: 300 },
  { name: "Mar", messages: 500 },
  { name: "Apr", messages: 700 },
  { name: "May", messages: 600 }
];

const barData = [
  { user: "User A", messages: 120 },
  { user: "User B", messages: 100 },
  { user: "User C", messages: 80 },
  { user: "User D", messages: 60 }
];

const pieData = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 }
];

const areaData = [
  { month: "Jan", activeUsers: 200 },
  { month: "Feb", activeUsers: 250 },
  { month: "Mar", activeUsers: 300 },
  { month: "Apr", activeUsers: 350 },
  { month: "May", activeUsers: 400 }
];

const scatterData = [
  { length: 100, responseTime: 50 },
  { length: 200, responseTime: 80 },
  { length: 300, responseTime: 120 },
  { length: 400, responseTime: 200 }
];

const radarData = [
  { subject: "Messages", UserA: 120, UserB: 98, UserC: 86 },
  { subject: "Avg Length", UserA: 110, UserB: 130, UserC: 120 },
  { subject: "Response Time", UserA: 130, UserB: 120, UserC: 150 },
  { subject: "Engagement", UserA: 90, UserB: 100, UserC: 95 }
];

// Custom colors for charts
const LINE_COLOR = "#FF5733";
const BAR_COLOR = "#33FF57";
const AREA_COLOR = "#3357FF";
const SCATTER_COLOR = "#FF33A1";
const RADAR_COLORS = ["#FF5733", "#33FF57", "#3357FF"];
const COLORS = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1"]; // Colors for the Pie chart

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-2 rounded">
        <h4 className="text-lg">{`${label}`}</h4>
        <p className="text-sm">{`Value: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-900 text-white space-y-8">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

      <Section title="Messages Over Time">
        <LineChart data={lineData}>
          <Line
            type="monotone"
            dataKey="messages"
            stroke={LINE_COLOR}
            strokeWidth={3}
          />
          <CartesianGrid stroke="#ccc" />
          <XAxis
            dataKey="name"
            label={{ value: "Month", position: "bottom" }}
          />
          <YAxis label={{ value: "Messages", angle: -90, position: "left" }} />
          <Tooltip content={<CustomTooltip />} />
        </LineChart>
      </Section>

      <Section title="Messages Sent by Users">
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="user"
            label={{ value: "Users", position: "bottom" }}
          />
          <YAxis label={{ value: "Messages", angle: -90, position: "left" }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="messages" fill={BAR_COLOR} />
        </BarChart>
      </Section>

      <Section title="Group Distribution">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            animationDuration={500}
            label
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </Section>

      <Section title="Active Users Over Time">
        <AreaChart data={areaData}>
          <Area
            type="monotone"
            dataKey="activeUsers"
            stroke={AREA_COLOR}
            fill={AREA_COLOR}
          />
          <CartesianGrid stroke="#ccc" />
          <XAxis
            dataKey="month"
            label={{ value: "Month", position: "bottom" }}
          />
          <YAxis
            label={{ value: "Active Users", angle: -90, position: "left" }}
          />
          <Tooltip content={<CustomTooltip />} />
        </AreaChart>
      </Section>

      <Section title="Message Length vs. Response Time">
        <ScatterChart>
          <XAxis
            type="number"
            dataKey="length"
            name="Length"
            unit="chars"
            label={{ value: "Message Length (chars)", position: "bottom" }}
          />
          <YAxis
            type="number"
            dataKey="responseTime"
            name="Time"
            unit="ms"
            label={{
              value: "Response Time (ms)",
              angle: -90,
              position: "left"
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={scatterData} fill={SCATTER_COLOR} />
        </ScatterChart>
      </Section>

      <Section title="User Engagement Metrics">
        <RadarChart outerRadius={90} data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis />
          <Radar
            name="User A"
            dataKey="UserA"
            stroke={RADAR_COLORS[0]}
            fill={RADAR_COLORS[0]}
            fillOpacity={0.6}
          />
          <Radar
            name="User B"
            dataKey="UserB"
            stroke={RADAR_COLORS[1]}
            fill={RADAR_COLORS[1]}
            fillOpacity={0.6}
          />
          <Radar
            name="User C"
            dataKey="UserC"
            stroke={RADAR_COLORS[2]}
            fill={RADAR_COLORS[2]}
            fillOpacity={0.6}
          />
          <Legend />
        </RadarChart>
      </Section>
    </div>
  );
};

// Reusable section component for better structure
const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      {children}
    </ResponsiveContainer>
  </div>
);

export default Dashboard;
