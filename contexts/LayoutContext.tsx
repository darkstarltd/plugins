
import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { BottomPanelType, SidebarView } from '../types';

interface LayoutContextType {
    sidebarWidth: number;
    setSidebarWidth: (width: number) => void;
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;
    
    bottomPanelHeight: number;
    setBottomPanelHeight: (height: number) => void;
    bottomPanel: BottomPanelType | null;
    setBottomPanel: (panel: BottomPanelType | null) => void;

    sidebarView: SidebarView;
    setSidebarView: (view: SidebarView) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [sidebarWidth, setSidebarWidth] = useLocalStorage('firefly_sidebarWidth', 288);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage('firefly_sidebarCollapsed', false);
    const [bottomPanelHeight, setBottomPanelHeight] = useLocalStorage('firefly_bottomPanelHeight', 256);
    const [bottomPanel, setBottomPanel] = useLocalStorage<BottomPanelType | null>('firefly_bottomPanel', 'terminal');
    const [sidebarView, setSidebarView] = useLocalStorage<SidebarView>('firefly_sidebarView', 'explorer');

    const value: LayoutContextType = {
        sidebarWidth,
        setSidebarWidth,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        bottomPanelHeight,
        setBottomPanelHeight,
        bottomPanel,
        setBottomPanel,
        sidebarView,
        setSidebarView,
    };

    return (
        <LayoutContext.Provider value={value}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = (): LayoutContextType => {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};
