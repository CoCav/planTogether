import Button from "../ui/Button";
import Card from "../ui/Card";
import Select from "../ui/Select";
import Input from "../ui/Input";
import FormField from "../ui/FormField";

/* ==================================================
   EVENTS FILTER CARD
   Reusable filter form for event listing pages

   Handles:
   - search and category filters
   - date filters
   - sorting controls
   - accessible filter visibility toggle
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
    const formId = "events-filters-form";

    return (
        <Card className="filter-card">
            <header className="filter-card-header">
                <div>
                    <h2 id="events-filters-title" className="section-title"> Filters</h2>

                    <p className="section-subtitle">Refine events by search, creator, category, location, date, or sorting.</p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={onToggleFilters}
                    aria-expanded={showFilters}
                    aria-controls={formId}
                >
                    {showFilters ? "Hide filters" : "Show filters"}
                </Button>
            </header>

            {showFilters && (
                <form id={formId} className="filter-form" onSubmit={onFilterSubmit} aria-labelledby="events-filters-title" >
                    <div className="form-grid">
                        <FormField label="Search" htmlFor="event-filter-search">
                            <Input
                                id="event-filter-search"
                                name="search"
                                value={filters.search}
                                onChange={onFilterChange}
                                placeholder="Search events..."
                            />
                        </FormField>

                        <FormField label="Creator" htmlFor="event-filter-creator">
                            <Input
                                id="event-filter-creator"
                                name="creator"
                                value={filters.creator}
                                onChange={onFilterChange}
                                placeholder="Search by creator..."
                            />
                        </FormField>

                        <FormField label="Type" htmlFor="event-filter-type">
                            <Input
                                id="event-filter-type"
                                name="type"
                                value={filters.type}
                                onChange={onFilterChange}
                                placeholder="Workshop, Meetup..."
                            />
                        </FormField>

                        <FormField label="Theme" htmlFor="event-filter-theme">
                            <Input
                                id="event-filter-theme"
                                name="theme"
                                value={filters.theme}
                                onChange={onFilterChange}
                                placeholder="Tech, Music..."
                            />
                        </FormField>

                        <FormField label="Mode" htmlFor="event-filter-mode">
                            <Select
                                id="event-filter-mode"
                                name="mode"
                                value={filters.mode}
                                onChange={onFilterChange}
                            >
                                <option value="">All</option>
                                <option value="online">Online</option>
                                <option value="in_person">In person</option>
                            </Select>
                        </FormField>

                        <FormField label="Location" htmlFor="event-filter-location">
                            <Input
                                id="event-filter-location"
                                name="location"
                                value={filters.location}
                                onChange={onFilterChange}
                                placeholder="City or place..."
                            />
                        </FormField>

                        <FormField label="Date" htmlFor="event-filter-date">
                            <Input
                                id="event-filter-date"
                                type="date"
                                name="date"
                                value={filters.date}
                                onChange={onFilterChange}
                            />
                        </FormField>

                        <FormField label="Start date" htmlFor="event-filter-start-date">
                            <Input
                                id="event-filter-start-date"
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={onFilterChange}
                                disabled={Boolean(filters.date)}
                            />
                        </FormField>

                        <FormField label="End date" htmlFor="event-filter-end-date">
                            <Input
                                id="event-filter-end-date"
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={onFilterChange}
                                disabled={Boolean(filters.date)}
                            />
                        </FormField>

                        <FormField label="Sort by" htmlFor="event-filter-sort-by">
                            <Select
                                id="event-filter-sort-by"
                                name="sortBy"
                                value={`${filters.sortBy || "startDateTime"}-${filters.order || "asc"}`}
                                onChange={onSortChange}
                            >
                                {Object.entries(sortLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </Select>
                        </FormField>
                    </div>

                    <div className="form-actions">
                        <Button type="submit">Apply filters</Button>

                        <Button type="button" variant="outline" onClick={onResetFilters}>Reset</Button>
                    </div>
                </form>
            )}
        </Card>
    );
}
