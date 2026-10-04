'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { trackLeadEvent } from '@/lib/analytics/conversion';

export function FunnelCta({ source, children = 'Plan your purchase', className = '', id }: {
  source: string; children?: ReactNode; className?: string; id?: string;
}) {
  return <a id={id} href="#enquire" className={`uk-funnel-button ${className}`}
    onClick={() => trackLeadEvent('lead_cta_click', { source, kind: 'contact' })}>
    {children}<ArrowRight size={18} aria-hidden="true" />
  </a>;
}

export function MobileFunnelCta({ source, label = 'Talk with Reza', ariaLabel = 'Plan your California purchase', afterScroll = false }: { source: string; label?: string; ariaLabel?: string; afterScroll?: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const targets = (afterScroll ? ['enquire'] : ['funnel-intro-actions', 'enquire']).map(id => document.getElementById(id));
    targets.push(document.querySelector('footer'));
    const update = () => {
      const focused = document.activeElement;
      const editing = focused instanceof HTMLElement && Boolean(focused.closest('input, textarea, select, [role="dialog"]'));
      const menuOpen = document.getElementById('mobile-menu-panel')?.getAttribute('aria-hidden') === 'false';
      const targetVisible = targets.some(target => {
        if (!target) return false;
        const rect = target.getBoundingClientRect();
        return rect.height > 0 && rect.bottom > 60 && rect.top < window.innerHeight;
      });
      setVisible((!afterScroll || window.scrollY > 80) && !editing && !menuOpen && !targetVisible);
    };
    const observer = new IntersectionObserver(update, { threshold: 0 });
    targets.forEach(target => { if (target) observer.observe(target); });
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    const menu = document.getElementById('mobile-menu-panel');
    const menuObserver = new MutationObserver(update);
    if (menu) menuObserver.observe(menu, { attributes: true, attributeFilter: ['aria-hidden'] });
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    return () => {
      observer.disconnect();
      menuObserver.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', update);
    };
  }, [source, afterScroll]);
  if (!visible) return null;
  return <aside className="uk-mobile-action" aria-label={ariaLabel}>
    <FunnelCta source={source}>{label}</FunnelCta>
  </aside>;
}
