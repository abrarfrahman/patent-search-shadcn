"use client"

import * as React from "react"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Columns } from "./Columns"
import { Claim, PatentSearchResult } from "@/data/patentDataSchema"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [searchText, setSearchText] = React.useState<string>('')
  const [results, setResults] =  React.useState<PatentSearchResult[]>([])
  const [claims, setClaims] = React.useState<Record<string, Claim[]>>({}); // Store claims by patent ID
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({}); // Manage row selection state
  
  const fetchClaims = async (patentId: string) => {
    try {
      const response = await fetch(`/api/claims?id=${encodeURIComponent(patentId)}`);
      const claimsData: Claim[] = await response.json();
      setClaims((prev) => ({ ...prev, [patentId]: claimsData }));
    } catch (error) {
      console.error("Error fetching claims:", error);
    }
  };
  
  // Fetch the first 10 patents on load
  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/patents/top/");
        const patents: PatentSearchResult[] = await response.json();
        setResults(patents);
      } catch (error) {
        console.error("Error fetching patents:", error);
      }
    }
    fetchData();
  }, []);

  // Handle string matching queries
  const handleSearch = async (e: { key: string }) => {
    if (e.key === 'Enter') {
      try {
        const response = await fetch(`/api/patents/query?query=${encodeURIComponent(searchText)}`);
        const searchResult = await response.json();
        if (response.ok) {
          setResults(searchResult);
        } else {
          console.error('Search error:', searchResult.error);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    }
  };

  const table = useReactTable({
    data: results,
    columns: Columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (newRowSelectionState) => {
      setRowSelection(newRowSelectionState);
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    }
  })

  React.useEffect(() => {
    const selectedRowIds = Object.keys(rowSelection);
    const selectedPatentIds = selectedRowIds.map((rowId) => table.getRow(rowId)?.original.id);
    console.log("Selected patent IDs:", selectedPatentIds);

    selectedPatentIds.forEach((patentId) => {
      if (patentId && !claims[patentId]) {
        fetchClaims(patentId);
      }
    });
  }, [rowSelection, claims, table]);

  return (
    <div className="scrollable-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <h1 style={{
        fontSize: '2em',
        fontWeight: 'bold',
        gap: '0.5em'
      }}>
        Patent Claims Builder 📝
      </h1>
      <br/>
      <h3>Fetch on load is 10 patents, fetch on search is unbounded. Search with one token at a time for now. Sort by id, title, or priority date. See console output for selection process logs for parsed claims JSON. Click the ... to get full patent metadata and claim selection. Sometimes you have to click twice. When you click Confirm Selection it prints the selected patent + claims to the console.</h3>
      <br/>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <div style={{ flex: '1' }}>
          <div className="flex py-4">
            <Input
              placeholder="Search patents by ID, title, author, etc..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearch}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )  
}