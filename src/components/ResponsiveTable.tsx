interface ResponsiveTableProps {
  caption: string;
  headers: string[];
  rows: string[][];
  rowHeaderIndex?: number;
  className?: string;
}

export function ResponsiveTable({ caption, headers, rows, rowHeaderIndex = 0, className = '' }: ResponsiveTableProps) {
  return (
    <div className={`responsive-table ${className}`}>
      <div className="responsive-table__desktop">
        <table>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>{headers.map((header, index) => <th key={`${header}-${index}`} scope="col">{header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${row[0] ?? 'row'}-${rowIndex}`}>
                {row.map((cell, columnIndex) => columnIndex === rowHeaderIndex
                  ? <th key={`${columnIndex}-${cell}`} scope="row">{cell}</th>
                  : <td key={`${columnIndex}-${cell}`}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="responsive-table__mobile" aria-label={caption}>
        {rows.map((row, rowIndex) => {
          const title = row[rowHeaderIndex] ?? `عنصر ${rowIndex + 1}`;
          return (
            <article className="table-card" key={`${title}-${rowIndex}`}>
              <h3>{title}</h3>
              <dl>
                {headers.map((header, columnIndex) => columnIndex !== rowHeaderIndex && (
                  <div className="table-card__row" key={`${header}-${columnIndex}`}>
                    <dt>{header}</dt>
                    <dd>{row[columnIndex] ?? '—'}</dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}
