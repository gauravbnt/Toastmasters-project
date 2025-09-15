import React from 'react'
import { Search, Filter } from 'lucide-react'

const SearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  filterValue, 
  onFilterChange, 
  filterOptions = [],
  placeholder = "Search...",
  filterLabel = "Filter"
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input-field pl-10"
        />
      </div>
      {filterOptions.length > 0 && (
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            className="input-field pl-10 pr-8 appearance-none bg-white"
          >
            <option value="">{filterLabel}</option>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

export default SearchFilter
