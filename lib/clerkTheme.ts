import type { Appearance } from '@clerk/types';

/**
 * Tema customizado do Clerk para combinar com a identidade visual do Mevo
 */
export const getClerkAppearance = (isDark: boolean): Appearance => ({
  variables: {
    // Cores principais
    colorPrimary: '#2563eb',           // blue-600
    colorDanger: '#ef4444',            // red-500
    colorSuccess: '#22c55e',           // green-500
    colorWarning: '#f59e0b',           // amber-500

    // Background
    colorBackground: isDark ? '#0B0C15' : '#ffffff',
    colorInputBackground: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',

    // Text
    colorText: isDark ? '#ffffff' : '#0f172a',
    colorTextSecondary: isDark ? '#94a3b8' : '#64748b',

    // Borders
    colorInputBorder: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',

    // Border radius
    borderRadius: '0.75rem',

    // Font
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontFamilyButtons: 'Inter, system-ui, -apple-system, sans-serif',
  },

  elements: {
    // Root card
    rootBox: {
      width: '100%',
      maxWidth: '24rem',
    },

    // Card container
    card: {
      backgroundColor: isDark ? '#0B0C15' : '#ffffff',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      borderRadius: '1rem',
      padding: '2rem',
    },

    // Header
    headerTitle: {
      fontSize: '1.25rem',
      fontWeight: '500',
      color: isDark ? '#ffffff' : '#0f172a',
    },
    headerSubtitle: {
      color: isDark ? '#94a3b8' : '#64748b',
      fontSize: '0.875rem',
    },

    // Logo
    logoBox: {
      height: '2.5rem',
    },
    logoImage: {
      height: '2.5rem',
    },

    // Form fields
    formFieldLabel: {
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '0.5rem',
    },
    formFieldInput: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      color: isDark ? '#ffffff' : '#0f172a',
      fontSize: '0.875rem',
      padding: '0.625rem 0.875rem',
      '&:focus': {
        borderColor: '#2563eb',
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
        outline: 'none',
      },
      '&::placeholder': {
        color: isDark ? '#64748b' : '#94a3b8',
      },
    },
    formFieldInputShowPasswordButton: {
      color: isDark ? '#64748b' : '#94a3b8',
    },

    // Primary button
    formButtonPrimary: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontSize: '0.875rem',
      fontWeight: '500',
      padding: '0.625rem 1rem',
      borderRadius: '0.5rem',
      textTransform: 'none',
      '&:hover': {
        backgroundColor: '#1d4ed8',
      },
      '&:active': {
        transform: 'scale(0.98)',
      },
      '&:disabled': {
        opacity: 0.5,
      },
    },

    // Social buttons
    socialButtonsBlockButton: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      color: isDark ? '#ffffff' : '#0f172a',
      fontSize: '0.875rem',
      fontWeight: '500',
      padding: '0.625rem 1rem',
      '&:hover': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f8fafc',
      },
    },
    socialButtonsBlockButtonText: {
      color: isDark ? '#ffffff' : '#0f172a',
      fontWeight: '500',
    },
    socialButtonsProviderIcon: {
      width: '1.25rem',
      height: '1.25rem',
    },

    // Divider
    dividerLine: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    },
    dividerText: {
      color: isDark ? '#64748b' : '#94a3b8',
      fontSize: '0.75rem',
    },

    // Footer links
    footerAction: {
      marginTop: '1.5rem',
    },
    footerActionText: {
      color: isDark ? '#94a3b8' : '#64748b',
      fontSize: '0.875rem',
    },
    footerActionLink: {
      color: '#2563eb',
      fontWeight: '500',
      '&:hover': {
        color: '#1d4ed8',
      },
    },

    // Identity preview (após login)
    identityPreview: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
      borderRadius: '0.5rem',
    },
    identityPreviewText: {
      color: isDark ? '#ffffff' : '#0f172a',
    },
    identityPreviewEditButton: {
      color: '#2563eb',
    },

    // Form field errors
    formFieldErrorText: {
      color: '#ef4444',
      fontSize: '0.75rem',
    },

    // Alert
    alert: {
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
      border: isDark ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid #fecaca',
      borderRadius: '0.5rem',
      color: isDark ? '#fca5a5' : '#dc2626',
    },

    // OTP input
    otpCodeFieldInput: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      color: isDark ? '#ffffff' : '#0f172a',
      '&:focus': {
        borderColor: '#2563eb',
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
      },
    },

    // User Button (avatar dropdown)
    userButtonBox: {
      width: '2.5rem',
      height: '2.5rem',
    },
    userButtonTrigger: {
      borderRadius: '9999px',
    },
    userButtonAvatarBox: {
      width: '2.5rem',
      height: '2.5rem',
      borderRadius: '9999px',
    },
    userButtonPopoverCard: {
      backgroundColor: isDark ? '#0B0C15' : '#ffffff',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
      borderRadius: '0.75rem',
    },
    userButtonPopoverActionButton: {
      color: isDark ? '#e2e8f0' : '#374151',
      '&:hover': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
      },
    },
    userButtonPopoverActionButtonText: {
      color: isDark ? '#e2e8f0' : '#374151',
    },
    userButtonPopoverActionButtonIcon: {
      color: isDark ? '#94a3b8' : '#64748b',
    },
    userButtonPopoverFooter: {
      borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
    },

    // User Profile
    userProfileCard: {
      backgroundColor: isDark ? '#0B0C15' : '#ffffff',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
    },

    // Navbar (dentro do modal de perfil)
    navbar: {
      backgroundColor: isDark ? '#050509' : '#f8fafc',
      borderRight: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
    },
    navbarButton: {
      color: isDark ? '#e2e8f0' : '#374151',
      '&:hover': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
      },
    },

    // Page (dentro do modal de perfil)
    pageScrollBox: {
      backgroundColor: isDark ? '#0B0C15' : '#ffffff',
    },

    // Profile section
    profileSectionTitle: {
      color: isDark ? '#ffffff' : '#0f172a',
    },
    profileSectionTitleText: {
      color: isDark ? '#ffffff' : '#0f172a',
    },
    profileSectionContent: {
      borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
    },

    // Accordion
    accordionTriggerButton: {
      color: isDark ? '#e2e8f0' : '#374151',
      '&:hover': {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
      },
    },
    accordionContent: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
    },

    // Badge
    badge: {
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : '#dbeafe',
      color: isDark ? '#60a5fa' : '#2563eb',
    },

    // Modal backdrop
    modalBackdrop: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
    },
  },
});

export default getClerkAppearance;
