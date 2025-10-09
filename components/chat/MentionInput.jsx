"use client";

import { Package, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * MentionInput component with @-mention typeahead.
 * Detects "@" character and shows dropdown with members and items.
 * Supports keyboard navigation and selection.
 */
export default function MentionInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "Type a message...",
  listId,
}) {
  // State for mention dropdown
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState({
    members: [],
    items: [],
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(-1);

  // Refs
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch mention suggestions from API
  useEffect(() => {
    if (showMentions && listId) {
      const fetchMentions = async () => {
        try {
          const response = await fetch(
            `/api/lists/${listId}/mentions?q=${encodeURIComponent(mentionQuery)}`,
          );
          if (response.ok) {
            const data = await response.json();
            setMentionResults(data);
          }
        } catch (error) {
          console.error("Error fetching mentions:", error);
        }
      };

      // Debounce the API call
      const timeoutId = setTimeout(fetchMentions, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [showMentions, mentionQuery, listId]);

  // Get flat list of all suggestions for keyboard navigation
  const allSuggestions = [...mentionResults.members, ...mentionResults.items];

  // Handle input change and detect @ character
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);

    // Find the last @ before cursor
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    // Check if we're in a mention context
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Only show mentions if there's no space after @
      if (!textAfterAt.includes(" ")) {
        setShowMentions(true);
        setMentionQuery(textAfterAt);
        setMentionStartPos(lastAtIndex);
        setSelectedIndex(0);
        return;
      }
    }

    // Hide mentions if conditions not met
    setShowMentions(false);
  };

  // Handle keyboard navigation in dropdown
  const handleKeyDown = (e) => {
    if (!showMentions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, allSuggestions.length - 1),
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        if (allSuggestions.length > 0) {
          e.preventDefault();
          handleSelectMention(allSuggestions[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowMentions(false);
        break;
    }
  };

  // Handle mention selection
  const handleSelectMention = (suggestion) => {
    if (!suggestion) return;

    const mentionText =
      suggestion.type === "user"
        ? `@${suggestion.username}`
        : `@${suggestion.name}`;

    // Replace the @query with the selected mention
    const before = value.substring(0, mentionStartPos);
    const after = value.substring(inputRef.current.selectionStart);
    const newValue = before + mentionText + " " + after;

    onChange(newValue);
    setShowMentions(false);

    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
      const newCursorPos = mentionStartPos + mentionText.length + 1;
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowMentions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="w-full"
        autoComplete="off"
      />

      {/* Mention dropdown */}
      {showMentions && allSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full left-0 w-full mb-2 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
        >
          {/* Members section */}
          {mentionResults.members.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-muted-foreground px-2 py-1 font-semibold">
                Members
              </div>
              {mentionResults.members.map((member, index) => {
                const globalIndex = index;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleSelectMention(member)}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors ${
                      selectedIndex === globalIndex ? "bg-accent" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.username}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      @{member.username}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Items section */}
          {mentionResults.items.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-muted-foreground px-2 py-1 font-semibold">
                Items
              </div>
              {mentionResults.items.map((item, index) => {
                const globalIndex = mentionResults.members.length + index;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMention(item)}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent transition-colors ${
                      selectedIndex === globalIndex ? "bg-accent" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <span
                        className={`text-sm font-medium ${
                          item.done ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        @{item.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
