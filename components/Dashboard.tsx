import React from 'react';
import { Bot, Bug, CheckCircle, Clock, FileCode, Terminal, Code, ArrowRight, FolderKanban, WandIcon } from 'lucide-react';
import type { Project } from '../types';
import { useProject } from '../contexts/ProjectContext';
import ProjectHealthModal from './ProjectHealthModal';

type WidgetId = 'stats' | 'health' | 'activity' | 'terminal' | 'projects';

const StatCard = React.memo<{ label: string; value: string; icon: React.ElementType; color: string; }>(({ label, value, icon: Icon, color }) => (
    <div className="bg-bg-inset p-4 rounded-lg flex items-start space-x-4">
        <div className={`mt-1 p-2 rounded-lg bg-bg-surface ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-sm text-text-muted">{label}</p>
            <p className="text-xl font-bold text-text-base">{value}</p>
        </div>
    </div>
));
StatCard.displayName = 'StatCard';


const StatsWidget: React.FC = () => {
     const stats = [
        { label: 'Code Scans', value: '142', icon: Code, color: 'text-primary' },
        { label: 'Errors Fixed', value: '93', icon: CheckCircle, color: 'text-green-400' },
        { label: 'AI Suggestions', value: '317', icon: Bot, color: 'text-accent' },
        { label: 'Time Saved', value: '~7.5h', icon: Clock, color: 'text-yellow-400' },
    ];
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full content-between">
            {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
    );
}

const ActivityItem: React.FC<{ icon: React.ElementType; text: React.ReactNode; time: string; color: string }> = ({ icon: Icon, text, time, color }) => (
    <div className="flex space-x-4 py-3">
        <div className={`p-2 rounded-full bg-bg-inset ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
            <p className="text-sm text-text-base">{text}</p>
            <p className="text-xs text-text-dim">{time}</p>
        </div>
    </div>
);

const ActivityFeedWidget: React.FC = () => (
    <div className="divide-y divide-border-base">
        <ActivityItem icon={Bug} text={<>Fixed a <span className="font-semibold text-red-400">NullPointerException</span> in <span className="text-text-base">MainActivity.java</span></>} time="2 minutes ago" color="text-red-400" />
        <ActivityItem icon={Bot} text={<>AI suggested using <span className="font-semibold text-accent">Optional Chaining</span> for <span className="text-text-base">utils.js</span></>} time="28 minutes ago" color="text-accent" />
        <ActivityItem icon={FileCode} text={<>Analyzed <span className="font-semibold text-primary">3 new files</span> in 'Flutter-Demo'</>} time="2 hours ago" color="text-primary" />
    </div>
);

const ProjectHealthItem = React.memo<{ project: Project; onAnalyze: (project: Project) => void }>(({ project, onAnalyze }) => {
    const { health } = project;
    const getHealthColor = () => {
        if (health > 90) return 'bg-green-500';
        if (health > 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };
     const getHealthTextColor = () => {
        if (health > 90) return 'text-green-400';
        if (health > 70) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="group space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-text-muted group-hover:text-text-base transition-colors">{project.name}</span>
                <span className={`font-semibold ${getHealthTextColor()}`}>{health}%</span>
            </div>
            <div className="w-full bg-bg-inset rounded-full h-2.5">
                <div className={`${getHealthColor()} h-2.5 rounded-full transition-all duration-500`} style={{width: `${health}%`}}></div>
            </div>
            <div className="text-right">
                <button onClick={() => onAnalyze(project)} className="text-xs flex items-center gap-1.5 text-accent opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
                    <WandIcon className="w-3 h-3" />
                    Analyze with Mona
                </button>
            </div>
        </div>
    );
});
ProjectHealthItem.displayName = 'ProjectHealthItem';

const ProjectHealthWidget: React.FC<{ projects: Project[]; onAnalyze: (project: Project) => void }> = ({ projects, onAnalyze }) => (
    <div className="space-y-4">
       {projects.length > 0 ? (
            [...projects].reverse().slice(0, 3).map(p => <ProjectHealthItem key={p.id} project={p} onAnalyze={onAnalyze} />)
        ) : (
            <div className="text-center text-text-dim py-6">
                <FolderKanban className="w-8 h-8 mx-auto mb-2" />
                <p>No projects to display.</p>
            </div>
        )}
    </div>
);

const TerminalWidget: React.FC = () => {
    const [history, setHistory] = React.useState<string[]>(['Welcome to FireFly terminal.']);
    const [input, setInput] = React.useState('');
    const endOfHistoryRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        endOfHistoryRef.current?.scrollIntoView();
    }, [history]);

    const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim()) {
            const newHistory = [...history, `> ${input}`];
            if (input.trim() === 'help') {
                newHistory.push("Available commands: 'clear', 'date'");
            } else if (input.trim() === 'date') {
                newHistory.push(new Date().toString());
            } else if (input.trim() === 'clear') {
                setHistory([]);
                setInput('');
                return;
            } else {
                 newHistory.push(`command not found: ${input}`);
            }
            setHistory(newHistory);
            setInput('');
        }
    }
    return (
         <div className="h-full bg-bg-inset text-text-base font-mono text-sm p-4 rounded-lg flex flex-col">
            <div className="flex-1 overflow-y-auto">
                {history.map((line, i) => <p key={i}>{line}</p>)}
                <div ref={endOfHistoryRef} />
            </div>
             <div className="flex items-center mt-2">
                <span className="text-accent mr-2">{'>'}</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleCommand}
                    className="flex-1 bg-transparent outline-none"
                />
            </div>
        </div>
    );
};

const ProjectsWidget: React.FC<{ onNavigate: (projectId: string) => void }> = ({ onNavigate }) => {
    const { projects } = useProject();
    const recentProjects = [...projects].reverse().slice(0, 3);

    return (
        <div className="space-y-3">
            {recentProjects.length > 0 ? (
                recentProjects.map(project => (
                    <div key={project.id} className="bg-bg-inset p-3 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-text-base">{project.name}</p>
                            <p className="text-xs text-text-dim">Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button 
                            onClick={() => onNavigate(project.id)}
                            className="flex items-center space-x-1.5 text-sm text-primary font-semibold hover:underline"
                        >
                            <span>Go to Editor</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ))
            ) : (
                <div className="text-center text-text-dim py-6">
                    <FolderKanban className="w-8 h-8 mx-auto mb-2" />
                    <p>No projects yet.</p>
                    <p className="text-xs">Create one from the 'Projects' view.</p>
                </div>
            )}
        </div>
    );
};

const WIDGETS_MAP: Record<WidgetId, { title: string; component: React.FC<any> }> = {
    'stats': { title: 'Quick Stats', component: StatsWidget },
    'activity': { title: 'Recent Activity', component: ActivityFeedWidget },
    'health': { title: 'Project Health', component: ProjectHealthWidget },
    'terminal': { title: 'Integrated Terminal', component: TerminalWidget },
    'projects': { title: 'My Projects', component: ProjectsWidget },
};

const Widget: React.FC<{ widgetId: WidgetId; onNavigateToProject?: (id: string) => void; projects: Project[], onAnalyzeProject?: (project: Project) => void }> = ({ widgetId, onNavigateToProject, projects, onAnalyzeProject }) => {
    const { title, component: C } = WIDGETS_MAP[widgetId];
    
    const props: any = {};
    if (widgetId === 'projects' && onNavigateToProject) {
        props.onNavigate = onNavigateToProject;
    }
    if (widgetId === 'health' && onAnalyzeProject) {
        props.projects = projects;
        props.onAnalyze = onAnalyzeProject;
    }


    return (
        <div className="bg-bg-surface border border-border-base rounded-xl flex flex-col h-full">
            <h2 className="p-4 border-b border-border-base text-lg font-semibold text-text-base">{title}</h2>
            <div className="p-4 flex-1 overflow-y-auto">
               <C {...props} />
            </div>
        </div>
    );
};

export const InteractiveDashboard: React.FC<{ onNavigateToProject: (projectId: string) => void }> = ({ onNavigateToProject }) => {
    const { projects } = useProject();
    const [analyzingProject, setAnalyzingProject] = React.useState<Project | null>(null);

    return (
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-bg-base">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-base mb-2">Dashboard</h1>
                <p className="text-text-muted">Welcome back! Here's an overview of your projects.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    <Widget widgetId="stats" projects={projects} />
                    <Widget widgetId="health" projects={projects} onAnalyzeProject={setAnalyzingProject} />
                </div>
                
                {/* Right Column */}
                <div className="space-y-8">
                    <Widget widgetId="projects" projects={projects} onNavigateToProject={onNavigateToProject} />
                    <Widget widgetId="activity" projects={projects} />
                </div>

                {/* Full-width Bottom Row */}
                <div className="lg:col-span-2">
                    <Widget widgetId="terminal" projects={projects} />
                </div>
            </div>

            {analyzingProject && (
                <ProjectHealthModal
                    project={analyzingProject}
                    onClose={() => setAnalyzingProject(null)}
                />
            )}
        </div>
    );
};