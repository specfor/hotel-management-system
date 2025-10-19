import type { ReactNode } from "react";
import type { ComponentSize } from "./ui";

// Table column configuration
export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: string | number;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  className?: string;
}

// Table row action configuration
export interface TableAction<T = Record<string, unknown>> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (record: T, index: number) => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: ComponentSize;
  disabled?: (record: T) => boolean;
  hidden?: (record: T) => boolean;
}

// Table pagination configuration
export interface TablePagination {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: number[];
  onChange?: (page: number, pageSize: number) => void;
}

// Table sort configuration
export interface TableSort {
  column: string;
  direction: "asc" | "desc";
}

// Table filter configuration
export interface TableFilter {
  [key: string]: unknown;
}

// Table props
export interface TableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  rowKey?: keyof T | ((record: T) => string);
  actions?: TableAction<T>[];
  pagination?: TablePagination | false;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[], selectedRowKeys: string[]) => void;
  onSort?: (sort: TableSort | null) => void;
  onFilter?: (filters: TableFilter) => void;
  emptyText?: string;
  size?: ComponentSize;
  className?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  onRowClick?: (record: T, index: number) => void;
  expandable?: {
    expandedRowRender: (record: T, index: number) => ReactNode;
    rowExpandable?: (record: T) => boolean;
  };
  showHeader?: boolean;
  scroll?: {
    x?: string | number;
    y?: string | number;
  };
}
