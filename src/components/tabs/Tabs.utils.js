import { defaultTabs } from "./Tabs.constants";

export function getInitialTabs() {
    const saved = localStorage.getItem("tabs");

    if (!saved) return defaultTabs;

    const savedTabs = JSON.parse(saved);
    const uniqueSavedTabs = savedTabs.filter(
        (tab, index, list) => list.findIndex((item) => item.id === tab.id) === index
    );
    const savedIds = new Set(uniqueSavedTabs.map((tab) => tab.id));
    const newTabs = defaultTabs.filter((tab) => !savedIds.has(tab.id));

    return [...uniqueSavedTabs, ...newTabs];
}

export function groupPinnedTabs(tabs) {
    return [
        ...tabs.filter((tab) => tab.pinned),
        ...tabs.filter((tab) => !tab.pinned),
    ];
}
