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
================================================== */

export default function EventsFilterCard({filters, showFilters, sortLabels, onToggleFilters, onFilterChange, onFilterSubmit, onSortChange, onResetFilters }) {

    return (
        <Card className="filter-card">

            {/* =========================
                Header
            ========================= */}
            <div className="filter-card-header">
                <div>
                    <h2 className="section-title">Filters</h2>
                    <p className="section-subtitle">Refine events by search, category, location, date, or sorting.</p>
                </div>

                <Button type="button" variant="outline" onClick={onToggleFilters}>{showFilters ? "Hide filters" : "Show filters"}</Button>
            </div>

            {/* =========================
                Form
            ========================= */}
            {showFilters && (
                <form onSubmit={onFilterSubmit} className="filter-form">

                    <div className="form-grid">

                        <FormField label="Search">
                            <Input
                                name="search"
                                value={filters.search}
                                onChange={onFilterChange}
                                placeholder="Search events..."
                            />
                        </FormField>

                        <FormField label="Type">
                            <Input
                                name="type"
                                value={filters.type}
                                onChange={onFilterChange}
                                placeholder="Workshop, Meetup..."
                            />
                        </FormField>

                        <FormField label="Theme">
                            <Input
                                name="theme"
                                value={filters.theme}
                                onChange={onFilterChange}
                                placeholder="Tech, Music..."
                            />
                        </FormField>

                        <FormField label="Mode">
                            <Select name="mode" value={filters.mode} onChange={onFilterChange}>
                                <option value="">All</option>
                                <option value="online">Online</option>
                                <option value="in_person">In person</option>
                            </Select>
                        </FormField>

                        <FormField label="Location">
                            <Input
                                name="location"
                                value={filters.location}
                                onChange={onFilterChange}
                                placeholder="City or place..."
                            />
                        </FormField>

                        <FormField label="Date">
                            <Input
                                type="date"
                                name="date"
                                value={filters.date}
                                onChange={onFilterChange}
                            />
                        </FormField>

                        <FormField label="Start date">
                            <Input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={onFilterChange}
                            />
                        </FormField>

                        <FormField label="End date">
                            <Input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={onFilterChange}
                            />
                        </FormField>

                        <FormField label="Sort by">
                            <Select name="sortBy" value={`${filters.sortBy || "startDateTime"}-${filters.order || "asc"}`} onChange={onSortChange}>
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