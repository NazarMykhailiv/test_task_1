import { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableTab({
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
                    tab.pinned ? "pinned" : "",
                    isBeforeActive ? "before-active" : "",
                    isAfterActive ? "after-active" : "",
                ].filter(Boolean).join(" ")}
                type="button"
                onClick={() => onOpen(tab.url)}
            >
                <span className="tab-icon" aria-hidden="true">
                    {tab.icon}
                </span>
                <span className="tab-label">{tab.label}</span>
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
