import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, LoadingSpinner, Input, Card } from "../primary";
import type { TableProps, TableColumn, TableSort, TableFilter } from "../../types/table";

function Table<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  rowKey,
  actions = [],
  pagination = false,
  onSelectionChange,
  onSort,
  onFilter,
  emptyText = "No data available",
  size = "md",
  className = "",
  rowClassName,
  onRowClick,
  expandable,
  showHeader = true,
  scroll,
  selectable = false,
  selectedRows = [],
}: TableProps<T>) {
  const [currentSort, setCurrentSort] = useState<TableSort | null>(null);
  const [filters, setFilters] = useState<TableFilter>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Generate row key
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(record);
    }
    if (rowKey) {
      return String(record[rowKey]);
    }
    return String(index);
  };

  // Handle sorting
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return;

    const newSort: TableSort = {
      column: column.key,
      direction: currentSort?.column === column.key && currentSort.direction === "asc" ? "desc" : "asc",
    };

    setCurrentSort(newSort);
    onSort?.(newSort);
  };

  // Handle filtering
  const handleFilter = (columnKey: string, value: string) => {
    const newFilters = { ...filters, [columnKey]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  // Handle row selection
  const handleRowSelection = (record: T, checked: boolean) => {
    if (!onSelectionChange) return;

    const key = getRowKey(record, 0);
    let newSelectedRows = [...selectedRows];

    if (checked) {
      newSelectedRows.push(record);
    } else {
      newSelectedRows = newSelectedRows.filter((row) => getRowKey(row, 0) !== key);
    }

    const selectedKeys = newSelectedRows.map((row) => getRowKey(row, 0));
    onSelectionChange(newSelectedRows, selectedKeys);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    const newSelectedRows = checked ? [...data] : [];
    const selectedKeys = newSelectedRows.map((row) => getRowKey(row, 0));
    onSelectionChange(newSelectedRows, selectedKeys);
  };

  // Handle row expansion
  const handleRowExpansion = (record: T) => {
    const key = getRowKey(record, 0);
    const newExpandedRows = new Set(expandedRows);

    if (expandedRows.has(key)) {
      newExpandedRows.delete(key);
    } else {
      newExpandedRows.add(key);
    }

    setExpandedRows(newExpandedRows);
  };

  // Pagination calculations
  const pageSize = pagination ? pagination.pageSize : data.length;
  const startIndex = pagination ? (currentPage - 1) * pageSize : 0;
  const endIndex = pagination ? startIndex + pageSize : data.length;
  const paginatedData = data.slice(startIndex, endIndex);

  // Size classes
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const cellPadding = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  // Render cell content
  const renderCellContent = (column: TableColumn<T>, record: T, index: number) => {
    if (column.render) {
      const value = column.dataIndex ? record[column.dataIndex] : undefined;
      return column.render(value, record, index);
    }

    if (column.dataIndex) {
      const value = record[column.dataIndex];
      return value !== null && value !== undefined ? String(value) : "";
    }

    return "";
  };

  // Check if all rows are selected
  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  if (loading) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-500">Loading data...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Table Container */}
      <div
        className="overflow-auto"
        style={{
          overflowX: scroll?.x ? "auto" : undefined,
          overflowY: scroll?.y ? "auto" : undefined,
          maxWidth: scroll?.x ? scroll.x : undefined,
          maxHeight: scroll?.y ? scroll.y : undefined,
        }}
      >
        <table className={`min-w-full ${sizeClasses[size]}`}>
          {/* Table Header */}
          {showHeader && (
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {/* Selection Header */}
                {selectable && (
                  <th className={`${cellPadding[size]} text-left`}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}

                {/* Expandable Header */}
                {expandable && <th className={`${cellPadding[size]} w-8`}></th>}

                {/* Column Headers */}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`${cellPadding[size]} text-${column.align || "left"} font-medium text-gray-900 ${
                      column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                    } ${column.className || ""}`}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={`w-3 h-3 ${
                              currentSort?.column === column.key && currentSort.direction === "asc"
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 -mt-1 ${
                              currentSort?.column === column.key && currentSort.direction === "desc"
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Filter Input */}
                    {column.filterable && (
                      <div className="mt-2">
                        <Input
                          size="sm"
                          placeholder={`Filter ${column.title}`}
                          value={String(filters[column.key] || "")}
                          onChange={(e) => handleFilter(column.key, e.target.value)}
                          className="w-full"
                        />
                      </div>
                    )}
                  </th>
                ))}

                {/* Actions Header */}
                {actions.length > 0 && <th className={`${cellPadding[size]} text-right`}>Actions</th>}
              </tr>
            </thead>
          )}

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              paginatedData.map((record, index) => {
                const key = getRowKey(record, index);
                const isSelected = selectedRows.some((row) => getRowKey(row, 0) === key);
                const isExpanded = expandedRows.has(key);
                const rowClass = typeof rowClassName === "function" ? rowClassName(record, index) : rowClassName || "";

                return (
                  <>
                    {/* Main Row */}
                    <tr
                      key={key}
                      className={`hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""} ${
                        onRowClick ? "cursor-pointer" : ""
                      } ${rowClass}`}
                      onClick={() => onRowClick?.(record, index)}
                    >
                      {/* Selection Cell */}
                      {selectable && (
                        <td className={cellPadding[size]}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleRowSelection(record, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                      )}

                      {/* Expandable Cell */}
                      {expandable && (
                        <td className={cellPadding[size]}>
                          {expandable.rowExpandable?.(record) !== false && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowExpansion(record);
                              }}
                              className="p-1"
                            >
                              <ChevronRight
                                className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              />
                            </Button>
                          )}
                        </td>
                      )}

                      {/* Data Cells */}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`${cellPadding[size]} text-${column.align || "left"} ${column.className || ""}`}
                        >
                          {renderCellContent(column, record, index)}
                        </td>
                      ))}

                      {/* Actions Cell */}
                      {actions.length > 0 && (
                        <td className={`${cellPadding[size]} text-right`}>
                          <div className="flex items-center justify-end space-x-2">
                            {actions.map((action) => {
                              if (action.hidden?.(record)) return null;

                              return (
                                <Button
                                  key={action.key}
                                  variant={action.variant === "danger" ? "secondary" : action.variant || "ghost"}
                                  size={action.size || "sm"}
                                  disabled={action.disabled?.(record)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(record, index);
                                  }}
                                  className="whitespace-nowrap"
                                >
                                  {action.icon && <span className="mr-1">{action.icon}</span>}
                                  {action.label}
                                </Button>
                              );
                            })}
                          </div>
                        </td>
                      )}
                    </tr>

                    {/* Expanded Row */}
                    {expandable && isExpanded && (
                      <tr>
                        <td
                          colSpan={
                            columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (actions.length > 0 ? 1 : 0)
                          }
                          className="px-0 py-0"
                        >
                          <div className="bg-gray-50 border-t border-gray-200">
                            {expandable.expandedRowRender(record, index)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            {pagination.showTotal && (
              <span>
                Showing {startIndex + 1} to {Math.min(endIndex, pagination.total)} of {pagination.total} entries
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => {
                const newPage = currentPage - 1;
                setCurrentPage(newPage);
                pagination.onChange?.(newPage, pagination.pageSize);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <span className="text-sm text-gray-700">
              Page {currentPage} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => {
                const newPage = currentPage + 1;
                setCurrentPage(newPage);
                pagination.onChange?.(newPage, pagination.pageSize);
              }}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
