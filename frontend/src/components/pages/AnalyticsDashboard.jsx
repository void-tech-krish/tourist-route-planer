import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Users, Map as MapIcon, Calendar } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const userGrowthData = [
  { name: 'Jan', users: 4000 },
  { name: 'Feb', users: 5500 },
  { name: 'Mar', users: 7200 },
  { name: 'Apr', users: 8100 },
  { name: 'May', users: 10500 },
  { name: 'Jun', users: 12400 },
];

const popularDestinations = [
  { name: 'Goa', visits: 4000 },
  { name: 'Kerala', visits: 3000 },
  { name: 'Rajasthan', visits: 2000 },
  { name: 'Himachal', visits: 2780 },
  { name: 'Uttarakhand', visits: 1890 },
];

const travelModes = [
  { name: 'Flight', value: 400 },
  { name: 'Train', value: 300 },
  { name: 'Car', value: 300 },
  { name: 'Bus', value: 200 },
];

const COLORS = ['#3b82f6', '#ef4444', '#f97316', '#10b981'];

const StatCard = ({ title, value, increase, icon: Icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-semibold text-lux-muted uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-lux-navy">{value}</h3>
      <p className="text-sm font-medium text-green-500 flex items-center gap-1 mt-2">
        <TrendingUp className="w-4 h-4" /> {increase}
      </p>
    </div>
    <div className="bg-lux-bg p-4 rounded-full text-lux-orange">
      <Icon className="w-8 h-8" />
    </div>
  </div>
);

export default function AnalyticsDashboard({ onClose }) {
  return (
    <div className="fixed inset-0 w-full h-full z-[100] flex bg-lux-bg font-sans overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onClose} 
            className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-lux-navy" />
          </button>
          <div>
            <h1 className="text-3xl font-serif font-bold text-lux-navy">Analytics Dashboard</h1>
            <p className="text-lux-muted font-medium mt-1">Platform usage and travel trends overview</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value="12,400" increase="+18% this month" icon={Users} />
          <StatCard title="Routes Planned" value="45,210" increase="+24% this month" icon={MapIcon} />
          <StatCard title="Active Sessions" value="1,240" increase="+5% today" icon={TrendingUp} />
          <StatCard title="Bookings" value="8,540" increase="+12% this month" icon={Calendar} />
        </div>



        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* User Growth Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-lux-navy mb-6">User Growth Over Time</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E07A5F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E07A5F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#8884d8" />
                  <YAxis stroke="#8884d8" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#E07A5F" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Travel Modes Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-lux-navy mb-6">Preferred Travel Modes</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={travelModes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {travelModes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Destinations Bar Chart */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-lux-navy mb-6">Most Searched Destinations</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularDestinations} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#8884d8" />
                  <YAxis stroke="#8884d8" />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    cursor={{fill: '#f8f9fa'}}
                  />
                  <Bar dataKey="visits" fill="#3D405B" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
