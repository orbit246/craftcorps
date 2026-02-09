import React, { useState, useEffect } from 'react';
import {
    Server, Store, Shirt, Sparkles,
    BarChart3, Upload, Globe, Settings,
    Plus, ExternalLink, Crown,
    Palette, Construction, Users, Clock,
    DollarSign, CheckCircle2, AlertCircle, ShoppingBag, Eye,
    TrendingUp, Activity, PieChart as PieChartIcon, Zap,
    Terminal, Play, Square, RotateCw, Cpu, HardDrive,
    MessageSquare, Shield, Save, X
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useToast } from '../contexts/ToastContext';

const CreatorView = ({ theme }) => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('servers');

    // --- SERVER MANAGEMENT STATE ---
    const [selectedServerId, setSelectedServerId] = useState(1);
    const [serverTab, setServerTab] = useState('overview'); // overview, console, players, settings
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // --- COSMETICS STATE ---
    const [cosmeticTab, setCosmeticTab] = useState('overview'); // overview, sales, catalog

    // MOCK DATA: CHARTS & METRICS
    const dauData = [
        { name: 'Mon', players: 1200 },
        { name: 'Tue', players: 1900 },
        { name: 'Wed', players: 1500 },
        { name: 'Thu', players: 2100 },
        { name: 'Fri', players: 2800 },
        { name: 'Sat', players: 3500 },
        { name: 'Sun', players: 3100 },
    ];

    const retentionData = [
        { day: 'Day 1', rate: 45 },
        { day: 'Day 3', rate: 28 },
        { day: 'Day 7', rate: 18 },
        { day: 'Day 14', rate: 12 },
        { day: 'Day 30', rate: 8 },
    ];

    const salesData = [
        { name: 'Mon', sales: 120 },
        { name: 'Tue', sales: 145 },
        { name: 'Wed', sales: 132 },
        { name: 'Thu', sales: 198 },
        { name: 'Fri', sales: 240 },
        { name: 'Sat', sales: 310 },
        { name: 'Sun', sales: 285 },
    ];

    // Mock Data - Resource Usage (Real-time-ish)
    const [resourceData, setResourceData] = useState([]);

    // Simulate live data
    useEffect(() => {
        const interval = setInterval(() => {
            setResourceData(prev => {
                const now = new Date();
                const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
                const newPoint = {
                    time,
                    cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
                    ram: Math.floor(Math.random() * 20) + 40  // 40-60%
                };
                const newData = [...prev, newPoint];
                if (newData.length > 20) newData.shift();
                return newData;
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const servers = [
        { id: 1, name: 'Survival SMP', status: 'online', players: '124/500', version: '1.20.4', type: 'Survival', uptime: '4d 12h' },
        { id: 2, name: 'Skyblock Hub', status: 'online', players: '85/200', version: '1.20.1', type: 'Skyblock', uptime: '12h 45m' },
        { id: 3, name: 'Creative Plots', status: 'offline', players: '0/100', version: '1.20.4', type: 'Creative', uptime: '0m' },
    ];

    const selectedServer = servers.find(s => s.id === selectedServerId) || servers[0];

    const consoleLogs = [
        "[10:45:22] [Server thread/INFO]: Preparing start region for level 0",
        "[10:45:23] [Server thread/INFO]: Prepared 85% of chunks",
        "[10:45:24] [Server thread/INFO]: Time elapsed: 1245ms",
        "[10:45:24] [Server thread/INFO]: Done (2.450s)! For help, type \"help\"",
        "[10:45:25] [Server thread/INFO]: Starting Remote Control listener",
        "[10:45:25] [Server thread/INFO]: RCON running on 0.0.0.0:25575",
        "[10:46:01] [User Authenticator #1/INFO]: UUID of player Steve is 8667ba71-b85a-4004-af54-457a9734eed7",
        "[10:46:01] [Server thread/INFO]: Steve[/127.0.0.1:54321] logged in with entity id 234 at (-120.5, 64.0, 230.1)",
        "[10:46:01] [Server thread/INFO]: Steve joined the game",
        "[10:48:12] [Server thread/WARN]: Can't keep up! Is the server overloaded? Running 2045ms or 40 ticks behind",
        "[10:52:05] [Server thread/INFO]: Alex joined the game",
        "[10:55:30] [Server thread/INFO]: Saving... saved the game",
    ];

    const mockPlayers = [
        { name: 'Steve', uuid: '8667ba71-b85a-4004-af54-457a9734eed7' },
        { name: 'Alex', uuid: 'de3bd714-9b50-482a-89a5-797931666687' },
        { name: 'CraftMaster', uuid: 'ec70bcaf-702f-4bb8-b48d-276fa52a780c' }, // Using random UUIDs provided or generated
        { name: 'NoobSlayer', uuid: 'b876ec32-e396-476b-a115-8438d83c67d4' },
        { name: 'BuilderBob', uuid: 'f84c6a79-0a4e-45e0-90eb-63e05458ceb8' },
        { name: 'RedstonePro', uuid: 'c6fb9391-aa5f-4b47-81f1-3d717e335555' },
    ];

    const mockPlugins = [
        { name: 'EssentialsX', version: '2.20.1', author: 'Essentials Team' },
        { name: 'WorldEdit', version: '7.3.0', author: 'EngineHub' },
        { name: 'Vault', version: '1.7.3', author: 'LangGui' },
        { name: 'LuckPerms', version: '5.4.102', author: 'Luck' },
        { name: 'Multiverse-Core', version: '4.3.1', author: 'Multiverse' },
        { name: 'ProtocolLib', version: '5.1.0', author: 'dmulloy2' },
    ];

    // Other Mock Data
    const cosmeticStats = {
        published: 12,
        pending: 3,
        totalUsers: 8540,
        totalRevenue: 3450.00,
        conversionRate: '4.2%',
        avgDailyEquips: 1200
    };

    const cosmetics = [
        { id: 1, name: 'Neon Cape', type: 'Cape', status: 'published', users: 1250, revenue: 450.00, date: '2023-11-15' },
        { id: 2, name: 'Dragon Wings', type: 'Wings', status: 'published', users: 850, revenue: 850.00, date: '2023-12-01' },
        { id: 3, name: 'Golden Halo', type: 'Hat', status: 'pending', users: 0, revenue: 0, date: '2024-01-20' },
        { id: 4, name: 'Cyber Glasses', type: 'Glasses', status: 'published', users: 420, revenue: 210.00, date: '2024-01-10' },
    ];

    const cosmeticTypeData = [
        { name: 'Capes', value: 45 },
        { name: 'Wings', value: 25 },
        { name: 'Hats', value: 20 },
        { name: 'Glasses', value: 10 },
    ];
    const CHART_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="flex-1 overflow-hidden bg-slate-950 select-none flex flex-col h-full relative font-sans">
            {/* Deep FX Layers */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/5 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            {/* Header */}
            <div className="px-8 pt-8 pb-6 flex items-end justify-between relative z-10 shrink-0">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <Crown className="text-purple-400" size={24} />
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Creator Dashboard</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                        <h1 className="text-4xl font-black text-white tracking-tight">Management Hub</h1>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex p-1 bg-slate-900/60 border border-white/5 rounded-xl backdrop-blur-md">
                    <button
                        onClick={() => setActiveTab('servers')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'servers'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Server size={14} /> Servers
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('cosmetics')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'cosmetics'
                            ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Palette size={14} /> Cosmetics
                        </div>
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-hidden relative z-10 flex flex-col">

                {/* SERVERS TAB */}
                {activeTab === 'servers' && (
                    <div className="flex-1 flex h-full p-8 pt-0 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Server List Sidebar */}
                        <div className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} flex flex-col gap-4 shrink-0 transition-all duration-300`}>
                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex-1 backdrop-blur-md flex flex-col gap-2 overflow-y-auto custom-scrollbar relative group/sidebar">
                                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} mb-2 p-2`}>
                                    {!isSidebarCollapsed && <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Servers</h3>}
                                    <Plus size={14} className="text-slate-500 cursor-pointer hover:text-white" />
                                </div>
                                {servers.map(server => (
                                    <div
                                        key={server.id}
                                        onClick={() => setSelectedServerId(server.id)}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer group relative overflow-hidden flex flex-col items-centerjustify-center ${selectedServerId === server.id
                                            ? 'bg-indigo-600/10 border-indigo-500/50'
                                            : 'bg-slate-900/40 border-transparent hover:bg-white/5 hover:border-white/5'
                                            }`}
                                        title={isSidebarCollapsed ? server.name : ''}
                                    >
                                        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'justify-between mb-1'}`}>
                                            {!isSidebarCollapsed && <span className={`text-sm font-bold truncate ${selectedServerId === server.id ? 'text-white' : 'text-slate-300'}`}>{server.name}</span>}
                                            <div className={`w-2 h-2 shrink-0 rounded-full ${server.status === 'online' ? 'bg-emerald-500 box-shadow-glow' : 'bg-red-500'}`} />
                                        </div>
                                        {!isSidebarCollapsed && (
                                            <div className="flex items-center justify-between text-[10px]">
                                                <span className="text-slate-500 truncate">{server.type} • {server.version}</span>
                                                <span className="font-mono text-slate-400">{server.players}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Collapse Toggle Button - Always visible at bottom */}
                                <div className="mt-auto pt-4 flex justify-end">
                                    <button
                                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
                                    >
                                        {isSidebarCollapsed ? <ExternalLink size={14} className="rotate-180" /> : <div className="flex items-center text-[10px] font-bold uppercase gap-1"><span className="text-xs">&lt;</span></div>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Server Management Panel */}
                        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                            {/* Detailed Header */}
                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md shrink-0">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${selectedServer.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                            {selectedServer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                                {selectedServer.name}
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${selectedServer.status === 'online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {selectedServer.status}
                                                </span>
                                            </h2>
                                            <p className="text-slate-400 text-xs font-mono mt-1 flex items-center gap-3">
                                                <span>ID: {selectedServer.id}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                <span>{selectedServer.type} {selectedServer.version}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                <span>Uptime: {selectedServer.uptime}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    {/* Status Indicator (Read Only) */}
                                    <div className="flex items-center gap-2">
                                        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${selectedServer.status === 'online'
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                                            }`}>
                                            <div className={`w-2 h-2 rounded-full ${selectedServer.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                            <span className="text-xs font-bold uppercase tracking-wider">
                                                {selectedServer.status === 'online' ? 'Server Online' : 'Server Offline'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Server Tabs */}
                                <div className="flex items-center gap-1 border-b border-white/5">
                                    {['overview', 'stats', 'console', 'players', 'plugins'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setServerTab(tab)}
                                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${serverTab === tab
                                                ? 'border-indigo-500 text-white'
                                                : 'border-transparent text-slate-500 hover:text-slate-300'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Server Tab Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">

                                {serverTab === 'overview' && (
                                    <>
                                        {/* Monitoring Graphs */}
                                        <div className="grid grid-cols-2 gap-4 h-64 shrink-0">
                                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-2"><Cpu size={14} /> CPU Usage</span>
                                                    <span className="text-xs font-mono font-bold text-emerald-400">42%</span>
                                                </div>
                                                <div className="flex-1 w-full min-h-0 pointer-events-none select-none" style={{ outline: 'none' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={resourceData}>
                                                            <defs>
                                                                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                            <YAxis hide domain={[0, 100]} />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="cpu"
                                                                stroke="#10b981"
                                                                strokeWidth={2}
                                                                fill="url(#colorCpu)"
                                                                isAnimationActive={false}
                                                                activeDot={false}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-2"><HardDrive size={14} /> RAM Usage</span>
                                                    <span className="text-xs font-mono font-bold text-purple-400">4.2GB / 8GB</span>
                                                </div>
                                                <div className="flex-1 w-full min-h-0 pointer-events-none select-none" style={{ outline: 'none' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={resourceData}>
                                                            <defs>
                                                                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                            <YAxis hide domain={[0, 100]} />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="ram"
                                                                stroke="#8b5cf6"
                                                                strokeWidth={2}
                                                                fill="url(#colorRam)"
                                                                isAnimationActive={false}
                                                                activeDot={false}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Console Preview */}
                                        <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-xs overflow-hidden flex flex-col min-h-[200px]">
                                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                                                <span className="text-slate-500 font-bold flex items-center gap-2"><Terminal size={12} /> Live Console</span>
                                                <button
                                                    onClick={() => setServerTab('console')}
                                                    className="text-[10px] text-indigo-400 hover:text-indigo-300"
                                                >
                                                    Open Full Console
                                                </button>
                                            </div>
                                            <div className="flex-1 overflow-hidden relative">
                                                <div className="absolute inset-0 overflow-y-auto custom-scrollbar flex flex-col justify-end space-y-1">
                                                    {consoleLogs.slice(-6).map((log, i) => (
                                                        <div key={i} className="text-slate-300 break-words hover:bg-white/5 px-1 rounded">
                                                            <span className="text-slate-600 mr-2">{log.split(']:')[0] + ']:'}</span>
                                                            <span className={log.includes('WARN') ? 'text-amber-400' : log.includes('ERROR') ? 'text-red-400' : 'text-slate-300'}>
                                                                {log.split(']:')[1]}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {serverTab === 'console' && (
                                    <div className="flex-1 bg-black border border-white/10 rounded-2xl p-0 font-mono text-xs overflow-hidden flex flex-col h-full relative">
                                        <div className="absolute top-2 right-4 z-10">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-white/10 px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
                                                Read Only Console
                                            </span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
                                            {consoleLogs.map((log, i) => (
                                                <div key={i} className="text-slate-300 break-words hover:bg-white/5 px-1 rounded">
                                                    <span className="text-slate-600 mr-2">{log.split(']:')[0] + ']:'}</span>
                                                    <span className={log.includes('WARN') ? 'text-amber-400' : log.includes('ERROR') ? 'text-red-400' : 'text-slate-300'}>
                                                        {log.split(']:')[1]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {serverTab === 'players' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in zoom-in-95 duration-300">
                                        {mockPlayers.map((player) => (
                                            <div key={player.uuid} className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex items-center gap-4 hover:bg-white/5 transition-colors group">
                                                <div className="relative shrink-0">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shadow-lg">
                                                        <img
                                                            src={`https://api.mineatar.io/face/${player.uuid}?scale=16`}
                                                            alt={player.name}
                                                            className="w-full h-full object-cover"
                                                            style={{ imageRendering: 'pixelated' }}
                                                        />
                                                    </div>
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="font-bold text-white text-sm truncate">{player.name}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono truncate">
                                                        {player.uuid}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {serverTab === 'plugins' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in zoom-in-95 duration-300">
                                        {mockPlugins.map((plugin) => (
                                            <div key={plugin.name} className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex items-center gap-4 hover:bg-white/5 transition-colors group">
                                                <div className="relative shrink-0">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-white/5">
                                                        <Zap size={20} className="text-indigo-400" />
                                                    </div>
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="font-bold text-white text-sm truncate">{plugin.name}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono truncate">
                                                        v{plugin.version} • {plugin.author}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {serverTab === 'stats' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        {/* Plugin Connection Status */}
                                        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 box-shadow-glow">
                                                    <Activity size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">Plugin Connection</h3>
                                                    <p className="text-xs text-slate-400">Status of the CraftCorps analytics plugin</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Reachable</span>
                                            </div>
                                        </div>

                                        {/* Engagement Metrics */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                        <Users size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">+12%</span>
                                                </div>
                                                <div className="text-2xl font-black text-white">1,245</div>
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Daily Joins</div>
                                            </div>
                                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                                        <Clock size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">+5m</span>
                                                </div>
                                                <div className="text-2xl font-black text-white">45m</div>
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Avg Session</div>
                                            </div>
                                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                                        <CheckCircle2 size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded">D7</span>
                                                </div>
                                                <div className="text-2xl font-black text-white">18%</div>
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Retention Rate</div>
                                            </div>
                                        </div>

                                        {/* Charts */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[300px]">
                                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col">
                                                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
                                                    <TrendingUp size={16} className="text-indigo-400" /> Player Activity
                                                </h3>
                                                <div className="flex-1 w-full min-h-0 pointer-events-none select-none" style={{ outline: 'none' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={dauData}>
                                                            <defs>
                                                                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                                itemStyle={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                                                            />
                                                            <Area type="monotone" dataKey="players" stroke="#6366f1" strokeWidth={3} fill="url(#colorActivity)" />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col">
                                                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
                                                    <CheckCircle2 size={16} className="text-emerald-400" /> Cohort Retention
                                                </h3>
                                                <div className="flex-1 w-full min-h-0 pointer-events-none select-none" style={{ outline: 'none' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={retentionData} barSize={40}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                            <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                                            <Tooltip
                                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                                itemStyle={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}
                                                            />
                                                            <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {/* COSMETICS TAB (Preserved high-level analytics) */}
                {activeTab === 'cosmetics' && (
                    <div className="flex h-full flex-col overflow-y-auto custom-scrollbar p-8 pt-0">
                        {/* Cosmetics Sub-Tabs */}
                        <div className="flex items-center gap-1 border-b border-white/5 mb-6 shrink-0">
                            {['overview', 'sales', 'catalog'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setCosmeticTab(tab)}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${cosmeticTab === tab
                                        ? 'border-pink-500 text-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {cosmeticTab === 'overview' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between group hover:border-pink-500/30 transition-colors h-32">
                                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-2">
                                            <Upload size={20} />
                                        </div>
                                        <div>
                                            <span className="text-3xl font-black text-white">{cosmeticStats.published}</span>
                                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Published</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between group hover:border-amber-500/30 transition-colors h-32">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-2">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <span className="text-3xl font-black text-white">{cosmeticStats.pending}</span>
                                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Pending Review</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between group hover:border-purple-500/30 transition-colors h-32">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <span className="text-3xl font-black text-white">{cosmeticStats.totalUsers.toLocaleString()}</span>
                                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Unique Users</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between group hover:border-emerald-500/30 transition-colors h-32">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <span className="text-3xl font-black text-emerald-400">{formatCurrency(cosmeticStats.totalRevenue)}</span>
                                            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Total Revenue</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col">
                                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
                                            <TrendingUp size={16} className="text-emerald-400" /> Revenue Trend
                                        </h3>
                                        <div className="flex-1 w-full min-h-[250px] pointer-events-none select-none" style={{ outline: 'none' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={salesData}>
                                                    <defs>
                                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                                    <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fill="url(#colorSales)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 min-h-[300px] flex flex-col">
                                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <PieChartIcon size={16} className="text-purple-400" /> Catalog Distribution
                                        </h3>
                                        <div className="flex-1 w-full relative pointer-events-none select-none" style={{ outline: 'none' }}>
                                            <ResponsiveContainer width="100%" height={200}>
                                                <PieChart>
                                                    <Pie
                                                        data={cosmeticTypeData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {cosmeticTypeData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="rgba(0,0,0,0)" />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                        itemStyle={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-3xl font-black text-white">{cosmeticStats.published}</span>
                                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Items</span>
                                            </div>
                                            {/* Custom Legend */}
                                            <div className="flex flex-wrap justify-center gap-3 mt-4">
                                                {cosmeticTypeData.map((entry, index) => (
                                                    <div key={index} className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index] }} />
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{entry.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {cosmeticTab === 'sales' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <ShoppingBag size={16} className="text-amber-400" /> Recent Transactions
                                    </h3>
                                    <table className="w-full text-left border-collapse">
                                        <thead className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/5">
                                            <tr>
                                                <th className="py-3 px-4">Item</th>
                                                <th className="py-3 px-4">User</th>
                                                <th className="py-3 px-4">Date</th>
                                                <th className="py-3 px-4 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                                            {[1, 2, 3, 4, 5, 6].map(i => (
                                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                                    <td className="py-3 px-4">Neon Cape</td>
                                                    <td className="py-3 px-4 text-slate-400">User#{1000 + i}</td>
                                                    <td className="py-3 px-4 text-slate-500">Just now</td>
                                                    <td className="py-3 px-4 text-right font-mono text-emerald-400">+$5.00</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {cosmeticTab === 'catalog' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                                <div className="flex justify-between items-center bg-slate-900/40 border border-white/5 rounded-2xl p-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Palette size={18} className="text-pink-400" /> Cosmetic Library
                                    </h3>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-colors text-xs uppercase tracking-wide">
                                        <Plus size={16} /> New Item
                                    </button>
                                </div>
                                <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-4 px-6">Item Name</th>
                                                <th className="py-4 px-6">Type</th>
                                                <th className="py-4 px-6">Status</th>
                                                <th className="py-4 px-6 text-right">Revenue</th>
                                                <th className="py-4 px-6 text-right">Users</th>
                                                <th className="py-4 px-6 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {cosmetics.map((item) => (
                                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-white/10 group-hover:border-pink-500/50 transition-colors">
                                                                <Shirt size={18} className="text-slate-400 group-hover:text-pink-400 transition-colors" />
                                                            </div>
                                                            <span className="font-bold text-white">{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-slate-400 text-sm font-medium">{item.type}</td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${item.status === 'published'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right font-mono text-emerald-400 font-bold">
                                                        {formatCurrency(item.revenue)}
                                                    </td>
                                                    <td className="py-4 px-6 text-right font-mono text-slate-400">
                                                        {item.users.toLocaleString()}
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <button className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                                                            <Settings size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatorView;
