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
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className={cn(
                                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400',
                                    column.headerClassName,
                                )}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                    {loading ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
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
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        No records found.
                                    </span>
                                )}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row) => (
                            <tr
                                key={rowKey(row)}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800/60"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={cn(
                                            'px-4 py-3 text-sm text-gray-700 dark:text-gray-300',
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
