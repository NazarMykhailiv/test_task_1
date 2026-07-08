import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    DndContext,
    MouseSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useLocation, useNavigate } from "react-router-dom";
import { SortableTab } from "./SortableTab";
import { getInitialTabs, groupPinnedTabs } from "./Tabs.utils";
import "./Tabs.scss";

export function Tabs() {
    const navigate = useNavigate();
    const location = useLocation();
    const tabsRef = useRef(null);
    const tabsListRef = useRef(null);
    const measureRef = useRef(null);

    const [tabs, setTabs] = useState(getInitialTabs);
    const [visibleCount, setVisibleCount] = useState(tabs.length);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [visiblePinTabId, setVisiblePinTabId] = useState(null);
    const [pinPopoverPosition, setPinPopoverPosition] = useState(null);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 150,
                tolerance: 5,
            },
        })
    );

    const visibleTabs = tabs.slice(0, visibleCount);
    const hiddenTabs = tabs.slice(visibleCount);

    useEffect(() => {
        localStorage.setItem("tabs", JSON.stringify(tabs));
    }, [tabs]);

    useLayoutEffect(() => {
        let frameId;
        let isMounted = true;

        const updateVisibleTabs = () => {
            if (!tabsRef.current || !tabsListRef.current || !measureRef.current) return;

            const fullContainerWidth = tabsRef.current.getBoundingClientRect().width;
            const measuredItems = Array.from(measureRef.current.querySelectorAll(".tab-item"));

            if (!fullContainerWidth || measuredItems.length === 0) return;

            const totalTabsWidth = measuredItems.reduce(
                (total, item) => total + item.getBoundingClientRect().width,
                0
            );

            if (totalTabsWidth <= fullContainerWidth) {
                setVisibleCount(tabs.length);
                return;
            }

            let usedWidth = 0;
            let nextVisibleCount = tabs.length;

            for (let index = 0; index < measuredItems.length; index += 1) {
                const itemWidth = measuredItems[index].offsetWidth;

                if (usedWidth + itemWidth > fullContainerWidth) {
                    nextVisibleCount = index + 1;
                    break;
                }

                usedWidth += itemWidth;
            }

            setVisibleCount(nextVisibleCount);
        };

        const scheduleUpdate = () => {
            if (!isMounted) return;

            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(updateVisibleTabs);
        };

        updateVisibleTabs();
        scheduleUpdate();

        const resizeObserver = new ResizeObserver(scheduleUpdate);

        if (tabsRef.current) {
            resizeObserver.observe(tabsRef.current);
        }

        if (tabsListRef.current) {
            resizeObserver.observe(tabsListRef.current);
        }

        window.addEventListener("resize", scheduleUpdate);
        document.fonts?.ready.then(scheduleUpdate);

        return () => {
            isMounted = false;
            cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            window.removeEventListener("resize", scheduleUpdate);
        };
    }, [tabs]);

    function togglePin(id) {
        setTabs((prev) =>
            groupPinnedTabs(
                prev.map((tab) =>
                    tab.id === id ? { ...tab, pinned: !tab.pinned } : tab
                )
            )
        );
        hidePinPopover();
    }

    function openTab(url) {
        navigate(url);
        setIsMenuOpen(false);
        hidePinPopover();
    }

    function showPinPopover(id, tabElement) {
        if (tabElement) {
            const tabRect = tabElement.getBoundingClientRect();
            const viewportPadding = 8;
            const right = Math.max(window.innerWidth - tabRect.right, viewportPadding);

            setPinPopoverPosition({
                top: tabRect.bottom,
                right,
            });
        }

        setVisiblePinTabId(id);
    }

    function hidePinPopover() {
        setVisiblePinTabId(null);
    }

    function handleDragStart() {
        hidePinPopover();
        setIsMenuOpen(false);
    }

    function handleDragEnd(event) {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setTabs((prev) => {
            const activeTab = prev.find((tab) => tab.id === active.id);
            const overTab = prev.find((tab) => tab.id === over.id);

            if (!activeTab || !overTab || activeTab.pinned !== overTab.pinned) {
                return prev;
            }

            const oldIndex = prev.findIndex((tab) => tab.id === active.id);
            const newIndex = prev.findIndex((tab) => tab.id === over.id);

            return arrayMove(prev, oldIndex, newIndex);
        });
    }

    return (
        <div className="tabs" ref={tabsRef}>
            <div className="tabs-list" ref={tabsListRef}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={visibleTabs.map((tab) => tab.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        {visibleTabs.map((tab, index) => (
                            <SortableTab
                                tab={tab}
                                key={tab.id}
                                isActive={location.pathname === tab.url}
                                isBeforeActive={visibleTabs[index + 1]?.url === location.pathname}
                                isAfterActive={visibleTabs[index - 1]?.url === location.pathname}
                                isPinVisible={visiblePinTabId === tab.id}
                                pinPopoverPosition={pinPopoverPosition}
                                onOpen={openTab}
                                onPin={togglePin}
                                onShowPin={showPinPopover}
                                onHidePin={hidePinPopover}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            {hiddenTabs.length > 0 && (
                <div className="more-menu">
                    <button
                        className={`more-button ${isMenuOpen ? "open" : ""}`}
                        type="button"
                        aria-label="Show hidden tabs"
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                    />

                    {isMenuOpen && (
                        <div className="dropdown">
                            {hiddenTabs.map((tab) => (
                                <button
                                    className={`dropdown-item ${location.pathname === tab.url ? "active" : ""}`}
                                    type="button"
                                    key={tab.id}
                                    onClick={() => openTab(tab.url)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="tabs-measure" ref={measureRef} aria-hidden="true">
                {tabs.map((tab) => (
                    <div className="tab-item" key={tab.id}>
                        <button className="tab" type="button">
                            {tab.label}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
