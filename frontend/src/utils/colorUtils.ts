import { AvailableColorScheme } from '../types/class';

// פונקציה לקבלת ערכת צבעים לפי שם הצבע
export const getColorScheme = (colorScheme?: AvailableColorScheme) => {
  const schemes = {
    pink: {
      gradient: 'from-pink-500 to-rose-500',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
      lightBg: 'bg-pink-50',
      focusRing: 'focus:ring-pink-500',
      focusBorder: 'focus:border-pink-500'
    },
    purple: {
      gradient: 'from-purple-500 to-indigo-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      lightBg: 'bg-purple-50',
      focusRing: 'focus:ring-purple-500',
      focusBorder: 'focus:border-purple-500'
    },
    emerald: {
      gradient: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600',
      lightBg: 'bg-emerald-50',
      focusRing: 'focus:ring-emerald-500',
      focusBorder: 'focus:border-emerald-500'
    },
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      lightBg: 'bg-blue-50',
      focusRing: 'focus:ring-blue-500',
      focusBorder: 'focus:border-blue-500'
    },
    red: {
      gradient: 'from-red-500 to-pink-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      lightBg: 'bg-red-50',
      focusRing: 'focus:ring-red-500',
      focusBorder: 'focus:border-red-500'
    },
    orange: {
      gradient: 'from-orange-500 to-red-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      lightBg: 'bg-orange-50',
      focusRing: 'focus:ring-orange-500',
      focusBorder: 'focus:border-orange-500'
    },
    yellow: {
      gradient: 'from-yellow-500 to-orange-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      lightBg: 'bg-yellow-50',
      focusRing: 'focus:ring-yellow-500',
      focusBorder: 'focus:border-yellow-500'
    },
    green: {
      gradient: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      lightBg: 'bg-green-50',
      focusRing: 'focus:ring-green-500',
      focusBorder: 'focus:border-green-500'
    },
    teal: {
      gradient: 'from-teal-500 to-cyan-500',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-500',
      hoverColor: 'hover:bg-teal-600',
      lightBg: 'bg-teal-50',
      focusRing: 'focus:ring-teal-500',
      focusBorder: 'focus:border-teal-500'
    },
    cyan: {
      gradient: 'from-cyan-500 to-blue-500',
      textColor: 'text-cyan-600',
      bgColor: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600',
      lightBg: 'bg-cyan-50',
      focusRing: 'focus:ring-cyan-500',
      focusBorder: 'focus:border-cyan-500'
    },
    indigo: {
      gradient: 'from-indigo-500 to-purple-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      lightBg: 'bg-indigo-50',
      focusRing: 'focus:ring-indigo-500',
      focusBorder: 'focus:border-indigo-500'
    },
    violet: {
      gradient: 'from-violet-500 to-purple-500',
      textColor: 'text-violet-600',
      bgColor: 'bg-violet-500',
      hoverColor: 'hover:bg-violet-600',
      lightBg: 'bg-violet-50',
      focusRing: 'focus:ring-violet-500',
      focusBorder: 'focus:border-violet-500'
    },
    fuchsia: {
      gradient: 'from-fuchsia-500 to-pink-500',
      textColor: 'text-fuchsia-600',
      bgColor: 'bg-fuchsia-500',
      hoverColor: 'hover:bg-fuchsia-600',
      lightBg: 'bg-fuchsia-50',
      focusRing: 'focus:ring-fuchsia-500',
      focusBorder: 'focus:border-fuchsia-500'
    },
    rose: {
      gradient: 'from-rose-500 to-pink-500',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-500',
      hoverColor: 'hover:bg-rose-600',
      lightBg: 'bg-rose-50',
      focusRing: 'focus:ring-rose-500',
      focusBorder: 'focus:border-rose-500'
    },
    slate: {
      gradient: 'from-slate-500 to-gray-500',
      textColor: 'text-slate-600',
      bgColor: 'bg-slate-500',
      hoverColor: 'hover:bg-slate-600',
      lightBg: 'bg-slate-50',
      focusRing: 'focus:ring-slate-500',
      focusBorder: 'focus:border-slate-500'
    },
    gray: {
      gradient: 'from-gray-500 to-slate-500',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-600',
      lightBg: 'bg-gray-50',
      focusRing: 'focus:ring-gray-500',
      focusBorder: 'focus:border-gray-500'
    },
    zinc: {
      gradient: 'from-zinc-500 to-gray-500',
      textColor: 'text-zinc-600',
      bgColor: 'bg-zinc-500',
      hoverColor: 'hover:bg-zinc-600',
      lightBg: 'bg-zinc-50',
      focusRing: 'focus:ring-zinc-500',
      focusBorder: 'focus:border-zinc-500'
    },
    neutral: {
      gradient: 'from-neutral-500 to-gray-500',
      textColor: 'text-neutral-600',
      bgColor: 'bg-neutral-500',
      hoverColor: 'hover:bg-neutral-600',
      lightBg: 'bg-neutral-50',
      focusRing: 'focus:ring-neutral-500',
      focusBorder: 'focus:border-neutral-500'
    },
    stone: {
      gradient: 'from-stone-500 to-gray-500',
      textColor: 'text-stone-600',
      bgColor: 'bg-stone-500',
      hoverColor: 'hover:bg-stone-600',
      lightBg: 'bg-stone-50',
      focusRing: 'focus:ring-stone-500',
      focusBorder: 'focus:border-stone-500'
    },
    amber: {
      gradient: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-500',
      hoverColor: 'hover:bg-amber-600',
      lightBg: 'bg-amber-50',
      focusRing: 'focus:ring-amber-500',
      focusBorder: 'focus:border-amber-500'
    },
    lime: {
      gradient: 'from-lime-500 to-green-500',
      textColor: 'text-lime-600',
      bgColor: 'bg-lime-500',
      hoverColor: 'hover:bg-lime-600',
      lightBg: 'bg-lime-50',
      focusRing: 'focus:ring-lime-500',
      focusBorder: 'focus:border-lime-500'
    }
  };
  
  return schemes[colorScheme || 'pink'] || schemes.pink;
};

// פונקציה לקבלת צבעים פשוטים (לכרטיסי שיעורים)
export const getSimpleColorScheme = (classItem: { color_scheme?: AvailableColorScheme; name?: string; category?: string }) => {
  // אם יש color_scheme מה-backend, השתמש בו
  if (classItem.color_scheme) {
    const schemes = {
      pink: {
        color: 'from-pink-500 to-rose-500',
        textColor: 'text-pink-600',
        bgColor: 'bg-pink-500',
        hoverColor: 'hover:bg-pink-600'
      },
      purple: {
        color: 'from-purple-500 to-indigo-500',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-500',
        hoverColor: 'hover:bg-purple-600'
      },
      emerald: {
        color: 'from-emerald-500 to-teal-500',
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-500',
        hoverColor: 'hover:bg-emerald-600'
      },
      blue: {
        color: 'from-blue-500 to-cyan-500',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-500',
        hoverColor: 'hover:bg-blue-600'
      }
    };
    
    return schemes[classItem.color_scheme as keyof typeof schemes] || schemes.pink;
  }
  
  // fallback לפי שם השיעור
  const name = classItem.name?.toLowerCase() || '';
  const cat = classItem.category?.toLowerCase() || '';
  
  if (name.includes('ניסיון') || cat.includes('trial')) {
    return {
      color: 'from-pink-500 to-rose-500',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600'
    };
  }
  if (name.includes('בודד') || cat.includes('single')) {
    return {
      color: 'from-purple-500 to-indigo-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    };
  }
  if (name.includes('אישי') || cat.includes('private')) {
    return {
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600'
    };
  }
  if (name.includes('מנוי') || name.includes('חודשי') || cat.includes('subscription')) {
    return {
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    };
  }
  
  // Default color scheme
  return {
    color: 'from-gray-500 to-gray-600',
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-500',
    hoverColor: 'hover:bg-gray-600'
  };
}; 