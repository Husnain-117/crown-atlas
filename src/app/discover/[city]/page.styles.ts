export const citySearchWidgetStyles = {
  container: "backdrop-blur-md p-6 sm:p-8 rounded-[16px] shadow-strong max-w-2xl mx-auto bg-[var(--surface)] border border-[var(--coastal-border)] theme-transition",
  title: "text-2xl font-semibold text-[var(--coastal-text)] mb-4 text-center theme-transition",
  form: "flex flex-col sm:flex-row items-center gap-3",
  inputContainer: "relative w-full",
  mapPinIcon: "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--coastal-muted-text)]",
  input: "pl-10 pr-3 py-3 text-base border-[var(--coastal-border)] focus:ring-[var(--coastal-secondary)] focus:border-[var(--coastal-secondary)] w-full rounded-lg bg-[var(--surface)] text-[var(--coastal-text)] theme-transition",
  button: "w-full sm:w-auto bg-[var(--coastal-primary)] hover:bg-[var(--primary-hover)] text-white px-8 py-3 rounded-lg",
  searchIcon: "h-5 w-5 mr-2",
  browseLinkText: "text-xs text-[var(--coastal-muted-text)] mt-3 text-center theme-transition",
  browseLink: "text-[var(--coastal-secondary)] hover:underline",
};

export const cityPageStyles = {
  // Common
  section: "mb-12 sm:mb-16",
  sectionTitle: "text-3xl font-bold text-[var(--coastal-text)] mb-8 text-center theme-transition",
  sectionTitleSpaced: "text-3xl font-bold text-[var(--coastal-text)] mb-10 text-center theme-transition",
  sectionTitleWithBorder: "text-2xl font-semibold text-[var(--coastal-text)] mb-6 border-b-2 border-[var(--coastal-accent)] pb-2 theme-transition",
  whiteCard: "bg-[var(--surface)] p-6 sm:p-8 rounded-[16px] shadow-medium theme-transition",
  propertyGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8",
  
  // Page Container
  pageContainer: "bg-[var(--bg)] min-h-screen theme-transition",
  mainContent: "max-w-[1440px] mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8",

  // Hero Section
  heroSection: "relative h-[60vh] min-h-[400px] sm:min-h-[500px] flex items-center justify-center text-center text-white overflow-hidden",
  heroImage: "object-cover",
  heroOverlay: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent",
  heroContent: "relative z-10 max-w-5xl mx-auto px-4",
  heroTitle: "text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight font-heading text-white shadow-text",
  heroSubtitle: "text-lg sm:text-xl text-gray-100 max-w-xl mx-auto shadow-text",

  // Intro & Search Section
  introSection: "mb-12 sm:mb-16 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center",
  introTextContainer: "lg:col-span-3 p-6 sm:p-8 rounded-[16px] shadow-medium bg-[var(--surface)] border border-[var(--coastal-border)] theme-transition",
  introTitle: "text-3xl font-bold text-[var(--coastal-text)] mb-4 theme-transition",
  introText: "text-[var(--coastal-muted-text)] leading-relaxed whitespace-pre-line theme-transition",
  introSearchContainer: "lg:col-span-2",

  // Map Section
  mapSectionTitle: "text-3xl font-bold text-[var(--coastal-text)] mb-6 text-center theme-transition",

  // Neighborhoods Section
  neighborhoodCategoryContainer: "mb-10",
  neighborhoodGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8",
  neighborhoodCardLink: "group block",
  neighborhoodCard: "bg-[var(--surface)] rounded-[16px] shadow-medium overflow-hidden transition-all duration-300 hover:shadow-strong theme-transition",
  neighborhoodImageContainer: "relative h-56",
  neighborhoodImage: "object-cover transition-transform duration-300 group-hover:scale-105",
  neighborhoodImageOverlay: "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent",
  neighborhoodName: "absolute bottom-4 left-4 text-xl font-semibold text-white font-heading",
  neighborhoodContent: "p-5",
  neighborhoodDescription: "text-sm text-[var(--coastal-muted-text)] mb-3 h-16 overflow-hidden text-ellipsis theme-transition",
  neighborhoodExploreLink: "inline-flex items-center text-[var(--coastal-secondary)] font-medium group-hover:underline",
  exploreArrowIcon: "h-4 w-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1",

  // Market Trends Section
  marketTrendsGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
  marketTrendCard: "bg-[var(--surface-muted)] p-5 rounded-lg text-center shadow-subtle theme-transition",
  marketTrendIcon: "h-10 w-10 mx-auto mb-3 text-[var(--coastal-secondary)]",
  marketTrendValue: "text-2xl font-bold text-[var(--coastal-text)] theme-transition",
  marketTrendMetric: "text-sm text-[var(--coastal-muted-text)] mb-1 theme-transition",
  marketTrendChangeBase: "text-xs font-semibold",
  marketTrendChange: {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-[var(--coastal-muted-text)]",
  } as Record<string, string>,
  marketTrendFootnote: "text-xs text-[var(--coastal-muted-text)] mt-6 text-center theme-transition",

  // Facts Section
  factsGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
  factCard: "flex items-start p-4 bg-[var(--surface-muted)] rounded-lg theme-transition",
  factIcon: "h-8 w-8 text-[var(--coastal-secondary)] mr-4 mt-1 flex-shrink-0",
  factTitle: "text-lg font-semibold text-[var(--coastal-text)] theme-transition",
  factValue: "text-[var(--coastal-muted-text)] theme-transition",

  // Testimonials Section
  testimonialsGrid: "grid grid-cols-1 md:grid-cols-3 gap-8",
  testimonialCard: "bg-[var(--surface)] p-6 rounded-[16px] shadow-medium flex flex-col theme-transition",
  testimonialRatingContainer: "flex mb-3",
  testimonialStarIcon: "h-5 w-5",
  testimonialStar: {
    filled: "text-[var(--coastal-accent)] fill-[var(--coastal-accent)]",
    empty: "text-[var(--surface-muted)] fill-[var(--surface-muted)]",
  },
  testimonialQuoteIcon: "h-8 w-8 text-[var(--coastal-secondary)]/30 mb-3",
  testimonialQuote: "text-[var(--coastal-muted-text)] italic mb-4 flex-grow theme-transition",
  testimonialAuthor: "font-semibold text-[var(--coastal-text)] theme-transition",
  testimonialLocation: "text-sm text-[var(--coastal-muted-text)] theme-transition",

  // Property Listings Preview Section
  propertiesButtonContainer: "text-center mt-6 sm:mt-10",
  propertiesViewAllButton: "bg-[var(--coastal-primary)] hover:bg-[var(--primary-hover)] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-[16px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold text-base sm:text-lg",
  propertiesSearchIcon: "h-5 w-5 mr-2",

  // FAQ Section
  faqAccordion: "w-full",
  faqTrigger: "text-lg text-left hover:text-[var(--coastal-secondary)] text-[var(--coastal-text)] theme-transition",
  faqContent: "text-[var(--coastal-muted-text)] leading-relaxed pt-2 theme-transition",
};
