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
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLocation, useNavigate } from "react-router-dom";
import "./tabs.scss";

const defaultTabs = [
    { id: "dashboard", label: "Dashboard", url: "/dashboard", pinned: false },
    { id: "banking", label: "Banking", url: "/banking", pinned: false },
    { id: "telephone", label: "Telephone", url: "/telephone", pinned: false },
    { id: "accounting", label: "Accounting", url: "/accounting", pinned: false },
    { id: "verkauf", label: "Verkauf", url: "/verkout", pinned: false },
    { id: "statistics", label: "Statistics", url: "/statistics", pinned: false },
    { id: "administration", label: "Administration", url: "/administration", pinned: false },
    { id: "post_office", label: "Post Office", url: "/post_office", pinned: false },
    { id: "help", label: "Help", url: "/help", pinned: false },
    { id: "warenbestand", label: "Warenbestand", url: "/warenbestand", pinned: false },
    { id: "test", label: "Test", url: "/test", pinned: false },
    { id: "reports", label: "Reports", url: "/reports", pinned: false },
    { id: "orders", label: "Orders", url: "/orders", pinned: false },
    { id: "customers", label: "Customers", url: "/customers", pinned: false },
    { id: "settings", label: "Settings", url: "/settings", pinned: false },
    { id: "calendar", label: "Calendar", url: "/calendar", pinned: false },
    { id: "messages", label: "Messages", url: "/messages", pinned: false },
    { id: "inventory", label: "Inventory", url: "/inventory", pinned: false },
    { id: "analytics", label: "Analytics", url: "/analytics", pinned: false },
    { id: "profile", label: "Profile", url: "/profile", pinned: false },
    { id: "archive", label: "Archive", url: "/archive", pinned: false },
    { id: "test1", label: "Test1", url: "/test1", pinned: false },
    { id: "test2", label: "Test2", url: "/test2", pinned: false },
];
function getInitialTabs() {
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

function groupPinnedTabs(tabs) {
    return [
        ...tabs.filter((tab) => tab.pinned),
        ...tabs.filter((tab) => !tab.pinned),
    ];
}

function SortableTab({
    tab,
    isActive,
    isBeforeActive,
    isAfterActive,
    isPinVisible,
    pinPopoverPosition,
    onOpen,
    onPin,
    onShowPin,
    onHidePin,
}) {
    const tabItemRef = useRef(null);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: tab.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    function setRefs(node) {
        tabItemRef.current = node;
        setNodeRef(node);
    }

    return (
        <div
            className={`tab-item ${isDragging ? "dragging" : ""}`}
            ref={setRefs}
            style={style}
            onMouseEnter={() => onShowPin(tab.id, tabItemRef.current)}
            onMouseLeave={onHidePin}
            {...attributes}
            {...listeners}
        >
            <button
                className={[
                    "tab",
                    isActive ? "active" : "",
                    isBeforeActive ? "before-active" : "",
                    isAfterActive ? "after-active" : "",
                ].filter(Boolean).join(" ")}
                type="button"
                onClick={() => onOpen(tab.url)}
            >
                {tab.label}
            </button>

            <div
                className={`pin-popover ${isPinVisible ? "visible" : ""}`}
                style={pinPopoverPosition ?? undefined}
            >
                <button
                    className="pin-button"
                    type="button"
                    aria-label={tab.pinned ? `Unpin ${tab.label}` : `Pin ${tab.label}`}
                    onClick={() => onPin(tab.id)}
                >
                    {tab.pinned ? "Unpin" : "Pin"}
                </button>
            </div>
        </div>
    );
}

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

            const containerWidth = fullContainerWidth;

            let usedWidth = 0;
            let nextVisibleCount = tabs.length;

            for (let index = 0; index < measuredItems.length; index += 1) {
                const itemWidth = measuredItems[index].offsetWidth;

                if (usedWidth + itemWidth > containerWidth) {
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
