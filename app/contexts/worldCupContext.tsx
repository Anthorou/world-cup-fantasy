"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ApiTeamStanding } from "../types/pool";

interface AppContextvalue {
	standings: ApiTeamStanding[];
	selectedPlayerId: string | null;
	setSelectedPlayerId: (playerId: string) => void;
	isPlayerLoading: boolean;
}

const AppContext = createContext<AppContextvalue | null>(null);

interface AppProviderProps {
	standings: ApiTeamStanding[];
	children: React.ReactNode;
}

export function AppProvider({ standings, children }: AppProviderProps) {
	const [selectedPlayerId, setSelectedPlayerIdState] = useState<string | null>(null);
	const [isPlayerLoading, setIsPlayerLoading] = useState<boolean>(true);

	useEffect(() => {
		setSelectedPlayerIdState(localStorage.getItem("currentPlayerId"));
		setIsPlayerLoading(false);
	}, []);

	function setSelectedPlayerId(playerId: string) {
		localStorage.setItem("currentPlayerId", playerId);
        setSelectedPlayerIdState(playerId);
	}

	return (
		<AppContext.Provider value={{standings, selectedPlayerId, setSelectedPlayerId, isPlayerLoading}} >
			{children}
		</AppContext.Provider>
	);
}

export function useApp() {
	const context = useContext(AppContext);

	if (!context) {
		throw new Error("WorldCupContext must be used inside the WorldCupProvider");
	}

	return context;
}