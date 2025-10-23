import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Edit, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function Table({
  data = [],
  columns = [],
  filterKeys = [],
  className,
  statusKey,
  titles = {},
  onEdit,
  onView,
  onDelete,
  onExport,
  actionsButtons = true,
  renderActionCell,
  renderReceiptCell,
  renderReasonCell,
  ...props
}) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedColumn, setSelectedColumn] = React.useState(
    columns.find((col) => !["img", "action", "reason"].includes(col.key))?.key || columns[0]?.key || ""
  );
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(0);
  const rowsPerPage = 15;

  // Initialize selectedFilters with default title values for each filterKey
  const initialFilters = React.useMemo(() => {
    const filters = {};
    filterKeys.forEach((key) => {
      filters[key] = titles[key] || key.charAt(0).toUpperCase() + key.slice(1);
    });
    return filters;
  }, [filterKeys, titles]);

  const [selectedFilters, setSelectedFilters] = React.useState(initialFilters);

  // Dynamically generate filter options
  const filterValues = React.useMemo(() => {
    const valuesMap = {};
    if (data && filterKeys.length > 0) {
      filterKeys.forEach((key) => {
        const title = titles[key] || key.charAt(0).toUpperCase() + key.slice(1);
        valuesMap[key] = [
          title,
          ...new Set(data.map((item) => item[key]?.trim())),
        ].filter(Boolean);
      });
    }
    return valuesMap;
  }, [data, filterKeys, titles]);

  // Column options for the combobox, excluding 'img', 'action', and 'reason'
  const columnOptions = columns
    .filter((col) => !["img", "action", "reason"].includes(col.key))
    .map((col) => ({
      value: col.key,
      label: col.label,
    }));

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleColumnChange = (value) => {
    setSelectedColumn(value);
    setSearchTerm("");
    setCurrentPage(0);
  };

  const handleFilterChange = (key) => (value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(0);
  };

  const handleFilterClick = (key) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: titles[key] || key.charAt(0).toUpperCase() + key.slice(1),
    }));
    setCurrentPage(0);
  };

  const filteredData = data
    ? data.filter((item) => {
        const matchesSearch =
          searchTerm === ""
            ? true
            : item[selectedColumn]
                ?.toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        const matchesFilters = filterKeys.length > 0
          ? filterKeys.every((key) => {
              const filterValue = selectedFilters[key];
              const title = titles[key] || key.charAt(0).toUpperCase() + key.slice(1);
              if (filterValue === title) return true;
              return item[key]?.trim() === filterValue;
            })
          : true;
        return matchesSearch && matchesFilters;
      })
    : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  return (
    <div className={cn("w-full p-4 bg-white rounded-lg shadow-sm", className)} {...props}>
      {/* Header with search, filters and actions */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">          
          <div className="flex items-center gap-2">
            {onExport && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onExport}
                      className="h-10 w-10 border-gray-300"
                    >
                      <Download size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-4">
          {/* Desktop Layout: Horizontal */}
          <div className="hidden xl:flex xl:flex-row xl:items-center xl:justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Combobox
                value={selectedColumn}
                onValueChange={handleColumnChange}
                options={columnOptions}
                placeholder="Select column"
                className="w-[200px] bg-gray-50 border-gray-200 rounded-md text-gray-700 font-medium"
              />
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder={`Search by ${columns.find((col) => col.key === selectedColumn)?.label || "column"}...`}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
            <div className="flex flex-row gap-2">
              {filterKeys.length > 0 &&
                filterKeys.map((key) => (
                  <Combobox
                    key={key}
                    value={
                      selectedFilters[key] ||
                      (titles[key] || key.charAt(0).toUpperCase() + key.slice(1))
                    }
                    onValueChange={handleFilterChange(key)}
                    onClick={() => handleFilterClick(key)}
                    options={
                      filterValues[key]?.map((value) => ({
                        value,
                        label: value,
                      })) || []
                    }
                    placeholder={titles[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                    className="w-[180px] bg-gray-50 border-gray-200 rounded-md text-gray-700 font-medium"
                  />
                ))}
            </div>
          </div>

          {/* Mobile Layout: Collapsible Filter Panel */}
          <div className="xl:hidden">
            <div className="flex items-center gap-2">
              <Combobox
                value={selectedColumn}
                onValueChange={handleColumnChange}
                options={columnOptions}
                placeholder="Select column"
                className="w-[140px] bg-gray-50 border-gray-200 rounded-md text-gray-700 font-medium"
              />
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder={`Search...`}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full border-gray-200 rounded-md"
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
              {/* <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex-shrink-0 h-10 w-10 border-gray-200"
              >
                <Filter size={18} />
              </Button> */}
            </div>

            <AnimatePresence>
              {isFilterOpen && filterKeys.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="mt-2 overflow-hidden bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filterKeys.map((key) => (
                      <Combobox
                        key={key}
                        value={
                          selectedFilters[key] ||
                          (titles[key] || key.charAt(0).toUpperCase() + key.slice(1))
                        }
                        onValueChange={handleFilterChange(key)}
                        onClick={() => handleFilterClick(key)}
                        options={
                          filterValues[key]?.map((value) => ({
                            value,
                            label: value,
                          })) || []
                        }
                        placeholder={titles[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                        className="w-full bg-white border-gray-200 rounded-md text-gray-700 font-medium"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div data-slot="table-container" className="relative w-full overflow-x-auto rounded-lg border border-gray-200">
        <table
          data-slot="table"
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        >
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-gray-50 hover:bg-gray-50">
              {columns.map((col) => (
                <TableHead key={col.key} className="py-3 font-semibold text-gray-700">
                  {col.label}
                </TableHead>
              ))}
              {actionsButtons && (
                <TableHead className="py-3 font-semibold text-gray-700 text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (actionsButtons ? 1 : 0)} 
                  className="text-center py-8 text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="rounded-full bg-gray-100 p-3 mb-3">
                      <Search size={24} className="text-gray-400" />
                    </div>
                    <p className="font-medium">No data found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  {columns.map((col) => (
                    <TableCell className="py-3" key={col.key}>
                      {/* Check if column has a custom renderCell function */}
                      {col.renderCell ? (
                        col.renderCell(item)
                      ) : col.key === "action" && renderActionCell ? (
                        renderActionCell(item)
                      ) : col.key === "receipt" && renderReceiptCell ? (
                        renderReceiptCell(item)
                      ) : col.key === "reason" && renderReasonCell ? (
                        renderReasonCell(item)
                      ) : col.key === "img" ? (
                        item[col.key] && item[col.key] !== "—" ? (
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={item[col.key]} alt={item.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {item.name?.charAt(0) || ""}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="w-10 h-10 bg-gray-100">
                            <AvatarFallback className="text-gray-600">
                              {item.name?.charAt(0) || "—"}
                            </AvatarFallback>
                          </Avatar>
                        )
                      ) : col.key === statusKey ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-medium",
                            item[col.key] === "verified" || item[col.key] === "Active" || item[col.key] === "active"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : item[col.key] === "unverified" || item[col.key] === "Inactive" || item[col.key] === "inactive"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : item[col.key] === "pending"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                          )}
                        >
                          {item[col.key]}
                        </Badge>
                      ) : (
                        <span className="text-gray-700">{item[col.key] || "—"}</span>
                      )}
                    </TableCell>
                  ))}
                  {actionsButtons && (
                    <TableCell className="py-3">
                      <div className="flex justify-center space-x-1">
                        {onView && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onView && onView(item)}
                                  className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                >
                                  <Eye size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {onEdit && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onEdit && onEdit(item)}
                                  className="h-8 w-8 text-gray-500 hover:text-green-600 hover:bg-green-50"
                                >
                                  <Edit size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {onDelete && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onDelete && onDelete(item)}
                                  className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredData.length > rowsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="text-sm text-gray-500">
            Showing {currentPage * rowsPerPage + 1} to {Math.min((currentPage + 1) * rowsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="flex items-center gap-1 px-3 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage <= 2) {
                  pageNum = i;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-9 w-9 p-0 ${currentPage === pageNum ? "bg-blue-600 text-white" : "border-gray-300 text-gray-700"}`}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
              {totalPages > 5 && <span className="px-1 text-gray-500">...</span>}
            </div>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Table Components with better styling
function TableHeader({ className, ...props }) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b bg-gray-50", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b border-gray-100 transition-colors",
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-4 text-left align-middle font-medium text-gray-700 whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };