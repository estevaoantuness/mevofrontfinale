import type { Appearance } from '@clerk/types';

/**
 * Tema customizado do Clerk para combinar com a identidade visual do Mevo
 *
 * Cores principais:
 * - Primary Blue: #2563EB (blue-600)
 * - Cyan Accent: #22D3EE (cyan-400)
 * - Dark Background: #050509, #0B0C15
 * - Light Background: #F8FAFC, #FFFFFF
 */
export const getClerkAppearance = (isDark: boolean): Appearance => ({
  variables: {
    // Cores principais da marca Mevo
    colorPrimary: '#2563EB',
    colorDanger: '#EF4444',
    colorSuccess: '#22C55E',
    colorWarning: '#F59E0B',

    // Background
    colorBackground: isDark ? '#0B0C15' : '#FFFFFF',
    colorInputBackground: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',

    // Texto
    colorText: isDark ? '#FFFFFF' : '#0F172A',
    colorTextSecondary: isDark ? '#94A3B8' : '#64748B',

    // Bordas
    colorInputBorder: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',

    // Border radius igual ao Mevo
    borderRadius: '0.5rem',

    // Font family
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    fontFamilyButtons: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  },

  elements: {
    // ==========================================
    // ROOT & CARD
    // ==========================================
    rootBox: {
      width: '100%',
      maxWidth: '24rem', // max-w-sm
    },

    card: {
      backgroundColor: isDark ? '#0B0C15' : '#FFFFFF',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      borderRadius: '1rem',
      padding: '2rem',
      backgroundImage: 'none',
    },

    // Remove Clerk branding gradient
    footer: {
      background: 'transparent',
      backgroundImage: 'none',
      '& + div': {
        background: 'transparent',
      },
    },

    footerPagesLink: {
      display: 'none',
    },

    // Internal card styling
    main: {
      backgroundColor: isDark ? '#0B0C15' : '#FFFFFF',
      backgroundImage: 'none',
    },

    // Remove/style the "Secured by Clerk" badge
    badge: {
      backgroundColor: 'transparent',
      backgroundImage: 'none',
    },

    // Card footer area (where gradient appears)
    cardFooter: {
      background: isDark ? '#0B0C15' : '#FFFFFF',
      backgroundImage: 'none',
      borderTop: 'none',
    },

    // Power by badge styling
    poweredBy: {
      background: isDark ? '#0B0C15' : '#FFFFFF',
      backgroundImage: 'none',
    },

    // Internal styling
    internal: {
      backgroundImage: 'none',
    },

    // ==========================================
    // HEADER
    // ==========================================
    headerTitle: {
      fontSize: '1.25rem',
      fontWeight: '500',
      color: isDark ? '#FFFFFF' : '#0F172A',
    },

    headerSubtitle: {
      color: isDark ? '#94A3B8' : '#64748B',
      fontSize: '0.875rem',
    },

    // ==========================================
    // FORM FIELDS
    // ==========================================
    formFieldLabel: {
      color: isDark ? '#94A3B8' : '#64748B',
      fontSize: '0.75rem',
      fontWeight: '500',
      marginBottom: '0.375rem',
    },

    formFieldInput: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
      borderRadius: '0.5rem',
      color: isDark ? '#FFFFFF' : '#0F172A',
      fontSize: '0.875rem',
      height: '2.5rem',
      padding: '0 0.75rem',
      transition: 'all 150ms ease',
      '&:focus': {
        borderColor: '#2563EB',
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
        outline: 'none',
      },
      '&::placeholder': {
        color: isDark ? '#64748B' : '#94A3B8',
      },
    },

    formFieldInputShowPasswordButton: {
      color: isDark ? '#64748B' : '#94A3B8',
      '&:hover': {
        color: isDark ? '#94A3B8' : '#64748B',
      },
    },

    formFieldErrorText: {
      color: '#EF4444',
      fontSize: '0.75rem',
      marginTop: '0.25rem',
    },

    // ==========================================
    // BUTTONS
    // ==========================================
    formButtonPrimary: {
      backgroundColor: '#2563EB',
      color: '#FFFFFF',
      fontSize: '0.875rem',
      fontWeight: '500',
      height: '2.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
      transition: 'all 150ms ease',
      textTransform: 'none' as const,
      '&:hover': {
        backgroundColor: '#1D4ED8',
      },
      '&:active': {
        transform: 'scale(0.98)',
      },
      '&:focus': {
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.3)',
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },

    // ==========================================
    // SOCIAL BUTTONS (Google, etc)
    // ==========================================
    socialButtonsBlockButton: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
      borderRadius: '0.5rem',
      color: isDark ? '#FFFFFF' : '#0F172A',
      fontSize: '0.875rem',
      fontWeight: '500',
      height: '2.5rem',
      transition: 'all 150ms ease',
      '&:hover': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F8FAFC',
        borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1',
      },
    },

    socialButtonsBlockButtonText: {
      color: isDark ? '#FFFFFF' : '#0F172A',
      fontWeight: '500',
    },

    socialButtonsProviderIcon: {
      width: '1.25rem',
      height: '1.25rem',
    },

    // ==========================================
    // DIVIDER
    // ==========================================
    dividerLine: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
    },

    dividerText: {
      color: isDark ? '#64748B' : '#94A3B8',
      fontSize: '0.75rem',
      textTransform: 'lowercase' as const,
    },

    // ==========================================
    // FOOTER
    // ==========================================
    footerAction: {
      marginTop: '1.5rem',
    },

    footerActionText: {
      color: isDark ? '#94A3B8' : '#64748B',
      fontSize: '0.875rem',
    },

    footerActionLink: {
      color: '#2563EB',
      fontWeight: '500',
      transition: 'color 150ms ease',
      '&:hover': {
        color: '#1D4ED8',
      },
    },

    // ==========================================
    // IDENTITY PREVIEW (after entering email)
    // ==========================================
    identityPreview: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
      borderRadius: '0.5rem',
    },

    identityPreviewText: {
      color: isDark ? '#FFFFFF' : '#0F172A',
    },

    identityPreviewEditButton: {
      color: '#2563EB',
      '&:hover': {
        color: '#1D4ED8',
      },
    },

    // ==========================================
    // ALERTS
    // ==========================================
    alert: {
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
      border: isDark ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid #FECACA',
      borderRadius: '0.5rem',
      color: isDark ? '#FCA5A5' : '#DC2626',
    },

    alertText: {
      color: isDark ? '#FCA5A5' : '#DC2626',
    },

    // ==========================================
    // OTP CODE INPUT
    // ==========================================
    otpCodeFieldInput: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
      borderRadius: '0.5rem',
      color: isDark ? '#FFFFFF' : '#0F172A',
      fontSize: '1.25rem',
      fontWeight: '600',
      '&:focus': {
        borderColor: '#2563EB',
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
      },
    },

    // ==========================================
    // USER BUTTON (Avatar dropdown)
    // ==========================================
    userButtonBox: {
      width: '2.5rem',
      height: '2.5rem',
    },

    userButtonTrigger: {
      borderRadius: '9999px',
      '&:focus': {
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.3)',
      },
    },

    userButtonAvatarBox: {
      width: '2.5rem',
      height: '2.5rem',
      borderRadius: '9999px',
    },

    userButtonPopoverCard: {
      backgroundColor: isDark ? '#0B0C15' : '#FFFFFF',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
      boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
      borderRadius: '0.75rem',
      overflow: 'hidden',
    },

    userButtonPopoverActionButton: {
      color: isDark ? '#E2E8F0' : '#374151',
      transition: 'background-color 150ms ease',
      '&:hover': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
      },
    },

    userButtonPopoverActionButtonText: {
      color: isDark ? '#E2E8F0' : '#374151',
    },

    userButtonPopoverActionButtonIcon: {
      color: isDark ? '#94A3B8' : '#64748B',
    },

    userButtonPopoverFooter: {
      borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
    },

    // ==========================================
    // USER PROFILE MODAL
    // ==========================================
    modalBackdrop: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
    },

    modalContent: {
      backgroundColor: isDark ? '#0B0C15' : '#FFFFFF',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
      borderRadius: '1rem',
    },

    // Navbar inside profile modal
    navbar: {
      backgroundColor: isDark ? '#050509' : '#F8FAFC',
      borderRight: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
    },

    navbarButton: {
      color: isDark ? '#E2E8F0' : '#374151',
      borderRadius: '0.5rem',
      transition: 'all 150ms ease',
      '&:hover': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
      },
      '&[data-active="true"]': {
        backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.1)',
        color: '#2563EB',
      },
    },

    // Page content inside profile
    pageScrollBox: {
      backgroundColor: isDark ? '#0B0C15' : '#FFFFFF',
    },

    page: {
      backgroundColor: isDark ? '#0B0C15' : '#FFFFFF',
    },

    // Profile sections
    profileSectionTitle: {
      color: isDark ? '#FFFFFF' : '#0F172A',
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
    },

    profileSectionTitleText: {
      color: isDark ? '#FFFFFF' : '#0F172A',
      fontWeight: '600',
    },

    profileSectionContent: {
      borderTop: 'none',
    },

    profileSectionPrimaryButton: {
      backgroundColor: '#2563EB',
      color: '#FFFFFF',
      '&:hover': {
        backgroundColor: '#1D4ED8',
      },
    },

    // Form inside profile
    formFieldRow: {
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #F1F5F9',
    },

    // Accordion
    accordionTriggerButton: {
      color: isDark ? '#E2E8F0' : '#374151',
      '&:hover': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
      },
    },

    accordionContent: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
    },

    // Badge
    badge: {
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : '#DBEAFE',
      color: isDark ? '#60A5FA' : '#2563EB',
      fontWeight: '500',
      fontSize: '0.75rem',
    },

    // Avatar uploader
    avatarImageActionsUpload: {
      backgroundColor: '#2563EB',
      color: '#FFFFFF',
      '&:hover': {
        backgroundColor: '#1D4ED8',
      },
    },

    // Phone input
    phoneInputBox: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
      borderRadius: '0.5rem',
    },

    // Select
    selectButton: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
      borderRadius: '0.5rem',
      color: isDark ? '#FFFFFF' : '#0F172A',
    },

    selectOptionsContainer: {
      backgroundColor: isDark ? '#0B0C15' : '#FFFFFF',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
      borderRadius: '0.5rem',
    },

    selectOption: {
      color: isDark ? '#E2E8F0' : '#374151',
      '&:hover': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
      },
      '&[data-selected="true"]': {
        backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.1)',
        color: '#2563EB',
      },
    },
  },
});

export default getClerkAppearance;
