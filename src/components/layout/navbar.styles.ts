export const navStyles = {
  // Sticky header with glassmorphism
  header: "sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-[var(--surface)]/80 dark:bg-[var(--surface)]/80 backdrop-blur-2xl border-b border-[var(--coastal-border)]/50 shadow-sm theme-transition",
  
  // Container with balanced padding
  container: "container mx-auto px-4 lg:px-6 xl:px-8 max-w-[1400px]",
  
  // Three-part layout: left nav | centered logo | right nav
  navContainer: "relative flex items-center justify-between h-20 lg:h-24 gap-4",
  
  // LEFT NAVIGATION - 5 items (Home, Buy, Rent, Sell, Corporate Relocation)
  leftNav: "hidden lg:flex items-center gap-1 flex-1 justify-start",
  
  // RIGHT NAVIGATION - 3 items + theme + auth
  rightNav: "hidden lg:flex items-center gap-1 flex-1 justify-end",
  
  // Shared nav link style with active state
  navLink: "px-3 xl:px-4 py-2.5 text-sm font-medium text-[var(--coastal-text)] hover:text-[var(--coastal-primary)] hover:bg-[var(--surface-muted)] transition-all duration-200 rounded-lg whitespace-nowrap theme-transition flex items-center",
  
  activeLink: "text-[var(--coastal-primary)] bg-[var(--surface-muted)]",
  
  // Dropdown styles
  dropdownContent: "min-w-[280px] p-2 bg-[var(--surface)]/95 dark:bg-[var(--surface)]/95 backdrop-blur-xl text-[var(--coastal-text)] border-[var(--coastal-border)] shadow-lg rounded-xl theme-transition mt-1",
  dropdownLabel: "text-sm font-bold px-4 py-3 text-[var(--coastal-primary)] uppercase tracking-wider border-b border-[var(--coastal-border)]",
  dropdownItem: "px-4 py-3 text-sm font-medium text-[var(--coastal-text)] hover:text-[var(--coastal-primary)] hover:bg-[var(--surface-muted)] rounded-lg transition-all duration-200 cursor-pointer theme-transition",
  
  // CENTERED LOGO - perfectly centered with absolute positioning
  logoContainer: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-shrink-0 flex justify-center items-center z-10 pointer-events-none",
  logoLink: "flex items-center justify-center group pointer-events-auto",
  logoImageContainer: "relative h-12 w-40 lg:h-14 lg:w-48 xl:h-16 xl:w-52 flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-105",
  
  // Divider between nav and auth
  divider: "h-6 w-px bg-[var(--coastal-border)] mx-2",
  
  // User button
  userButton: "flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[var(--coastal-text)] hover:text-[var(--coastal-primary)] hover:bg-[var(--surface-muted)] transition-all duration-200 rounded-lg theme-transition",
  
  // Auth buttons
  loginOutlineButton: "px-4 py-2.5 text-sm font-medium border-[var(--coastal-border)] text-[var(--coastal-text)] hover:bg-[var(--surface-muted)] hover:text-[var(--coastal-primary)] hover:border-[var(--coastal-primary)] transition-all duration-200 rounded-lg",
  signUpButton: "px-5 py-2.5 text-sm font-semibold bg-[var(--coastal-primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-none hover:scale-105",
  
  // MOBILE MENU STYLES
  mobileMenuButton: "lg:hidden text-[var(--coastal-text)] p-2 hover:bg-[var(--surface-muted)] rounded-lg transition-all duration-200 flex-shrink-0 z-10 theme-transition",
  mobileMenuContainer: "lg:hidden bg-[var(--surface)]/95 dark:bg-[var(--surface)]/95 backdrop-blur-xl border-t border-[var(--coastal-border)] fixed left-0 right-0 top-[80px] shadow-lg max-h-[calc(100vh-80px)] overflow-y-auto z-[9998] rounded-b-xl theme-transition",
  mobileNav: "flex flex-col space-y-1 p-4",
  mobileDropdownButton: "w-full flex items-center justify-between px-4 py-3 font-medium rounded-lg text-[var(--coastal-text)] hover:text-[var(--coastal-primary)] hover:bg-[var(--surface-muted)] transition-colors duration-200 theme-transition",
  mobileChevron: (isOpen: boolean) => `ml-2 h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`,
  mobileDropdownContent: "ml-4 mt-2 flex flex-col space-y-1",
  mobileDropdownItem: "block px-4 py-3 text-sm rounded-lg text-[var(--coastal-muted-text)] hover:text-[var(--coastal-primary)] hover:bg-[var(--surface-muted)] transition-all duration-200 font-medium theme-transition",
  mobileNavLink: "px-4 py-3 font-medium rounded-lg text-[var(--coastal-text)] hover:text-[var(--coastal-primary)] hover:bg-[var(--surface-muted)] transition-colors duration-200 theme-transition",
  mobileButtonsContainer: "mt-6 flex flex-col space-y-3 p-4 border-t border-[var(--coastal-border)]",
  mobileSignInButton: "justify-center w-full text-[var(--coastal-text)] border-[var(--coastal-border)] hover:bg-[var(--surface-muted)] hover:text-[var(--coastal-primary)] hover:border-[var(--coastal-secondary)] rounded-lg font-semibold transition-all duration-300",
  mobileListPropertyButton: "bg-[var(--coastal-primary)] hover:bg-[var(--primary-hover)] text-white justify-center w-full font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105",
};