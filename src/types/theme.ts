export interface ThemeConfig {
  template: 'classic' | 'corporate' | 'showcase' | 'modern' | 'minimal' | 'exclusive' | 'units' | 'members' | 'flow' | 'shop' | 'academy';
  colors: {
    primary: string;
    background: string;
    surface: string;
    accent: string;
    text: string;
    textSecondary: string;
  };
  layout: {
    headerStyle: 'full-cover' | 'top-nav' | 'centered' | 'minimal';
    contentLayout: 'single-column' | 'sidebar' | 'grid' | 'cards';
    buttonStyle: 'rounded' | 'square' | 'pill' | 'minimal';
    cardStyle: 'elevated' | 'flat' | 'outlined' | 'glassmorphism';
    spacing: 'compact' | 'normal' | 'spacious';
    typography: 'modern' | 'classic' | 'minimal' | 'bold';
  };
  effects: {
    animations: boolean;
    shadows: boolean;
    gradients: boolean;
    blur: boolean;
  };
}

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  classic: {
    template: 'classic',
    colors: {
      primary: '#4783F6',
      background: '#1a1a1a',
      surface: '#2d2d2d',
      accent: '#6366f1',
      text: '#ffffff',
      textSecondary: '#b3b3b3'
    },
    layout: {
      headerStyle: 'full-cover',
      contentLayout: 'single-column',
      buttonStyle: 'rounded',
      cardStyle: 'elevated',
      spacing: 'normal',
      typography: 'classic'
    },
    effects: {
      animations: true,
      shadows: true,
      gradients: true,
      blur: false
    }
  },
  corporate: {
    template: 'corporate',
    colors: {
      primary: '#2563eb',
      background: '#0f172a',
      surface: '#1e293b',
      accent: '#3b82f6',
      text: '#f8fafc',
      textSecondary: '#94a3b8'
    },
    layout: {
      headerStyle: 'top-nav',
      contentLayout: 'sidebar',
      buttonStyle: 'square',
      cardStyle: 'flat',
      spacing: 'compact',
      typography: 'modern'
    },
    effects: {
      animations: false,
      shadows: false,
      gradients: false,
      blur: false
    }
  },
  showcase: {
    template: 'showcase',
    colors: {
      primary: '#8b5cf6',
      background: '#0f0f23',
      surface: '#1a1a2e',
      accent: '#a855f7',
      text: '#ffffff',
      textSecondary: '#c084fc'
    },
    layout: {
      headerStyle: 'full-cover',
      contentLayout: 'cards',
      buttonStyle: 'pill',
      cardStyle: 'glassmorphism',
      spacing: 'spacious',
      typography: 'bold'
    },
    effects: {
      animations: true,
      shadows: true,
      gradients: true,
      blur: true
    }
  },
  modern: {
    template: 'modern',
    colors: {
      primary: '#06b6d4',
      background: '#0f172a',
      surface: '#1e293b',
      accent: '#0891b2',
      text: '#f1f5f9',
      textSecondary: '#64748b'
    },
    layout: {
      headerStyle: 'top-nav',
      contentLayout: 'cards',
      buttonStyle: 'rounded',
      cardStyle: 'elevated',
      spacing: 'normal',
      typography: 'modern'
    },
    effects: {
      animations: true,
      shadows: true,
      gradients: true,
      blur: false
    }
  },
  exclusive: {
    template: 'exclusive',
    colors: {
      primary: '#3b82f6',
      background: '#ffffff',
      surface: '#f8fafc',
      accent: '#2563eb',
      text: '#1e293b',
      textSecondary: '#64748b'
    },
    layout: {
      headerStyle: 'centered',
      contentLayout: 'single-column',
      buttonStyle: 'rounded',
      cardStyle: 'elevated',
      spacing: 'normal',
      typography: 'modern'
    },
    effects: {
      animations: true,
      shadows: true,
      gradients: true,
      blur: false
    }
  },
  members: {
    template: 'members',
    colors: {
      primary: '#a855f7',
      background: '#1a1625',
      surface: '#7c3aed',
      accent: '#c084fc',
      text: '#ffffff',
      textSecondary: '#e9d5ff'
    },
    layout: {
      headerStyle: 'full-cover',
      contentLayout: 'grid',
      buttonStyle: 'pill',
      cardStyle: 'elevated',
      spacing: 'normal',
      typography: 'modern'
    },
    effects: {
      animations: true,
      shadows: true,
      gradients: true,
      blur: true
    }
  },
  flow: {
    template: 'flow',
    colors: {
      primary: '#7c3aed',
      background: '#0f0a1f',
      surface: '#1a1230',
      accent: '#a855f7',
      text: '#ffffff',
      textSecondary: '#c4b5fd'
    },
    layout: {
      headerStyle: 'full-cover',
      contentLayout: 'grid',
      buttonStyle: 'rounded',
      cardStyle: 'elevated',
      spacing: 'normal',
      typography: 'modern'
    },
    effects: {
      animations: true,
      shadows: true,
      gradients: true,
      blur: true
    }
  },
  shop: {
    template: 'shop',
    colors: {
      primary: '#10b981',
      background: '#059669',
      surface: '#047857',
      accent: '#34d399',
      text: '#ffffff',
      textSecondary: '#d1fae5'
    },
    layout: {
      headerStyle: 'centered',
      contentLayout: 'grid',
      buttonStyle: 'rounded',
      cardStyle: 'elevated',
      spacing: 'normal',
      typography: 'modern'
    },
    effects: {
      animations: true,
      shadows: true,
      gradients: true,
      blur: false
    }
  },
  academy: {
    template: 'academy',
    colors: {
      primary: '#ef4444',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      accent: '#fbbf24',
      text: '#ffffff',
      textSecondary: '#9ca3af'
    },
    layout: {
      headerStyle: 'minimal',
      contentLayout: 'grid',
      buttonStyle: 'rounded',
      cardStyle: 'elevated',
      spacing: 'compact',
      typography: 'bold'
    },
    effects: {
      animations: true,
      shadows: true,
      gradients: true,
      blur: false
    }
  }
};