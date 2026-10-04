"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { NeighborhoodCard } from "@/components/neighborhoods/NeighborhoodCard"
import { getNeighborhoodSlug } from "@/lib/neighborhood-utils"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import NeighborhoodSearch from "./NeighborhoodSearch"

const ITEMS_PER_PAGE = 12

interface NeighborhoodWithCity {
  name: string
  description: string
  /** Buy-page href from city-data, e.g. "/buy/san-diego/la-jolla" */
  href: string
  image?: string
  cityName: string
  cityId: string
  category: string
}

interface NeighborhoodsClientProps {
  neighborhoods: NeighborhoodWithCity[]
}

export default function NeighborhoodsClient({ neighborhoods }: NeighborhoodsClientProps) {
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState(neighborhoods)
  const [currentPage, setCurrentPage] = useState(1)

  // Reset to page 1 whenever search/filter results change
  useEffect(() => {
    setCurrentPage(1)
  }, [filteredNeighborhoods])

  const totalPages = Math.ceil(filteredNeighborhoods.length / ITEMS_PER_PAGE)
  const pagedNeighborhoods = filteredNeighborhoods.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      {/* Search and Filter */}
      <section className="mb-6 sm:mb-8 md:mb-12">
        <NeighborhoodSearch neighborhoods={neighborhoods} onFilterChange={setFilteredNeighborhoods} />
      </section>

      {/* Neighborhoods Grid */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--coastal-text)] theme-transition">
            All Neighborhoods
          </h2>
          <Badge
            variant="outline"
            className="text-sm sm:text-base px-3 sm:px-4 py-1.5 w-fit border-[var(--coastal-border)] text-[var(--coastal-muted-text)]"
          >
            {filteredNeighborhoods.length} Total
          </Badge>
        </div>

        {filteredNeighborhoods.length === 0 ? (
          <div className="text-center py-12 bg-[var(--surface)] border border-[var(--coastal-border)] rounded-2xl">
            <p className="text-[var(--coastal-muted-text)] text-base sm:text-lg px-4">
              No neighborhoods found matching your search criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {pagedNeighborhoods.map((hood, index) => {
                // Canonical detail page URL: /neighborhoods/san-diego/la-jolla
                const detailHref = `/neighborhoods/${hood.cityId}/${getNeighborhoodSlug(hood.href)}`
                return (
                  <NeighborhoodCard
                    key={`${hood.cityId}-${hood.name}-${index}`}
                    name={hood.name}
                    description={hood.description}
                    image={hood.image}
                    cityName={hood.cityName}
                    category={hood.category}
                    href={detailHref}
                    priority={index < 6}
                  />
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) handlePageChange(currentPage - 1)
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNumber = i + 1
                      if (totalPages > 5) {
                        if (currentPage > 3) {
                          pageNumber = currentPage - 2 + i
                        }
                        if (pageNumber > totalPages) {
                          pageNumber = totalPages - (4 - i)
                        }
                      }
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(pageNumber)
                            }}
                            isActive={currentPage === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) handlePageChange(currentPage + 1)
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}

