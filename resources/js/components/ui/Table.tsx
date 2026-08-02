import { cn } from '@/utils/cn';
import { type ReactNode } from 'react';

export interface TableColumn<T> {
    key: string;
    header: ReactNode;
    cell: (row: T) => ReactNode;
    className?: string;
    headerClassName?: string;
}

interface TableProps<T> {
    columns: Array<TableColumn<T>>;
    rows: T[];
    rowKey: (row: T) => string | number;
    emptyState?: ReactNode;
    loading?: boolean;
}

export default function Table<T>({
    columns,
    rows,
    rowKey,
    emptyState,
    loading,
}: TableProps<T>) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className={cn(
                                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500',
                                    column.headerClassName,
                                )}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-8 text-center text-sm text-gray-500"
                            >
                                Loading...
                            </td>
                        </tr>
                    ) : rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-8 text-center"
                            >
                                {emptyState ?? (
                                    <span className="text-sm text-gray-500">
                                        No records found.
                                    </span>
                                )}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row) => (
                            <tr
                                key={rowKey(row)}
                                className="hover:bg-gray-50"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={cn(
                                            'px-4 py-3 text-sm text-gray-700',
                                            column.className,
                                        )}
                                    >
                                        {column.cell(row)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
