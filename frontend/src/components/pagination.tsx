import React from 'react';

interface Props {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  totalRecords,
  recordsPerPage,
  onPageChange
}) => {
  const startRecord = (currentPage - 1) * recordsPerPage + 1;
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Showing {totalRecords} {totalRecords === 1 ? 'record' : 'records'}
        </div>
      </div>
    );
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing {startRecord}-{endRecord} of {totalRecords} records
      </div>

      <div className="pagination-controls">
        <div className="pagination-nav-group">
          <button
            className="pagination-btn pagination-nav"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="First page"
          >
            «
          </button>

          <button
            className="pagination-btn pagination-nav"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous page"
          >
            ‹
          </button>
        </div>

        <div className="pagination-numbers">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                ...
              </span>
            ) : (
              <button
                key={page}
                className={`pagination-btn pagination-number ${
                  currentPage === page ? 'active' : ''
                }`}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <div className="pagination-nav-group">
          <button
            className="pagination-btn pagination-nav"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Next page"
          >
            ›
          </button>

          <button
            className="pagination-btn pagination-nav"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Last page"
          >
            »
          </button>
        </div>
      </div>

      <div className="pagination-jump">
        <span>Go to page:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={(e) => {
            const page = parseInt(e.target.value);
            if (page >= 1 && page <= totalPages) {
              onPageChange(page);
            }
          }}
          className="pagination-input"
        />
      </div>
    </div>
  );
};