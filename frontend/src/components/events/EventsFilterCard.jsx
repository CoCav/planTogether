import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";

import { EVENT_MODES, getEventModeLabel } from "../../features/shared/constants/eventModes";

import Button from "../ui/Button";
import Card from "../ui/Card";
import FormField from "../ui/FormField";
import Input from "../ui/Input";
import Select from "../ui/Select";

/* ==================================================
   EVENTS FILTER CARD
   Reusable filter form for event listing pages

   Handles:
   - search filters
   - date filters
   - sorting controls
   - accessible visibility toggle
================================================== */

export default function EventsFilterCard({
    filters,
    showFilters,
    sortLabels,
    onToggleFilters,
    onFilterChange,
    onFilterSubmit,
    onSortChange,
    onResetFilters
}) {

    /* =============================
       CONSTANTS
    ============================= */

    // Accessible form identifier
    const formId = "events-filters-form";

    // Select-ready sort options
    const sortOptions = Object.entries(sortLabels);

    return (
        <Card className="events-filter-card">
            <header className="events-filter-card-header">
                <div>
                    <h2 id="events-filters-title" className="section-title">
                        Filters
                    </h2>

                    <p className="section-subtitle">
                        Refine events by search, creator, category,
                        location, date, or sorting.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={onToggleFilters}
                    aria-expanded={showFilters}
                    aria-controls={formId}
                >
                    <SlidersHorizontal aria-hidden="true" />
                    {showFilters ? "Hide filters" : "Show filters"}
                </Button>
            </header>

            {showFilters && (
                <form
                    id={formId}
                    className="events-filter-form"
                    onSubmit={onFilterSubmit}
                    aria-labelledby="events-filters-title"
                >

                    <section className="events-filter-section" aria-labelledby="events-filter-main-title">
                        <h3 id="events-filter-main-title" className="events-filter-section-title">Main filters</h3>

                        <div className="events-filter-grid">
                            <FormField label="Search" htmlFor="event-filter-search">
                                {(errorId) => (
                                    <Input
                                        id="event-filter-search"
                                        name="search"
                                        value={filters.search}
                                        onChange={onFilterChange}
                                        placeholder="Search events"
                                        aria-describedby={errorId}
                                    />
                                )}
                            </FormField>

                            <FormField label="Creator" htmlFor="event-filter-creator">
                                {(errorId) => (
                                    <Input
                                        id="event-filter-creator"
                                        name="creator"
                                        value={filters.creator}
                                        onChange={onFilterChange}
                                        placeholder="Search by creator"
                                        aria-describedby={errorId}
                                    />
                                )}
                            </FormField>

                            <FormField label="Type" htmlFor="event-filter-type">
                                {(errorId) => (
                                    <Input
                                        id="event-filter-type"
                                        name="type"
                                        value={filters.type}
                                        onChange={onFilterChange}
                                        placeholder="e.g. Workshop, Meetup..."
                                        aria-describedby={errorId}
                                    />
                                )}
                            </FormField>

                            <FormField label="Theme" htmlFor="event-filter-theme">
                                {(errorId) => (
                                    <Input
                                        id="event-filter-theme"
                                        name="theme"
                                        value={filters.theme}
                                        onChange={onFilterChange}
                                        placeholder="e.g. Technology, Music..."
                                        aria-describedby={errorId}
                                    />
                                )}
                            </FormField>

                            <FormField label="Mode" htmlFor="event-filter-mode">
                                {(errorId) => (
                                    <Select
                                        id="event-filter-mode"
                                        name="mode"
                                        value={filters.mode}
                                        onChange={onFilterChange}
                                        aria-describedby={errorId}
                                    >
                                        <option value="">All Modes</option>

                                        <option value={EVENT_MODES.ONLINE}>
                                            {getEventModeLabel(EVENT_MODES.ONLINE)}
                                        </option>

                                        <option value={EVENT_MODES.IN_PERSON}>
                                            {getEventModeLabel(EVENT_MODES.IN_PERSON)}
                                        </option>
                                    </Select>
                                )}
                            </FormField>

                            <FormField label="Location" htmlFor="event-filter-location">
                                {(errorId) => (
                                    <Input
                                        id="event-filter-location"
                                        name="location"
                                        value={filters.location}
                                        onChange={onFilterChange}
                                        placeholder="e.g. Montreal"
                                        aria-describedby={errorId}
                                    />
                                )}
                            </FormField>
                        </div>
                    </section>

                    <section className="events-filter-section" aria-labelledby="events-filter-dates-title">
                        <h3 id="events-filter-dates-title" className="events-filter-section-title">Dates</h3>

                        <div className="events-filter-grid">
                            <FormField label="Date" htmlFor="event-filter-date">
                                {(errorId) => (
                                    <Input
                                        id="event-filter-date"
                                        type="date"
                                        name="date"
                                        value={filters.date}
                                        onChange={onFilterChange}
                                        aria-describedby={errorId}
                                    />
                                )}
                            </FormField>

                            <FormField label="Start date" htmlFor="event-filter-start-date">
                                {(errorId) => (
                                    <Input
                                        id="event-filter-start-date"
                                        type="date"
                                        name="startDate"
                                        value={filters.startDate}
                                        onChange={onFilterChange}
                                        disabled={Boolean(filters.date)}
                                        aria-describedby={errorId}
                                    />
                                )}
                            </FormField>

                            <FormField label="End date" htmlFor="event-filter-end-date">
                                {(errorId) => (
                                    <Input
                                        id="event-filter-end-date"
                                        type="date"
                                        name="endDate"
                                        value={filters.endDate}
                                        onChange={onFilterChange}
                                        disabled={Boolean(filters.date)}
                                        aria-describedby={errorId}
                                    />
                                )}
                            </FormField>
                        </div>
                    </section>

                    <section className="events-filter-section" aria-labelledby="events-filter-sort-title">
                        <h3 id="events-filter-sort-title" className="events-filter-section-title">Sort</h3>

                        <div className="events-filter-toolbar">
                            <div className="events-filter-sort">
                                <FormField label="Sort by" htmlFor="event-filter-sort-by">
                                    {(errorId) => (
                                        <Select
                                            id="event-filter-sort-by"
                                            name="sortBy"
                                            value={`${filters.sortBy || "startDateTime"}-${filters.order || "asc"}`}
                                            onChange={onSortChange}
                                            aria-describedby={errorId}
                                        >
                                            {sortOptions.map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </Select>
                                    )}
                                </FormField>
                            </div>

                            <div className="events-filter-actions">
                                <Button type="submit">
                                    <Search aria-hidden="true" />
                                    Apply filters
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onResetFilters}
                                >
                                    <RotateCcw aria-hidden="true" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </section>
                </form>
            )}
        </Card>
    );
}
