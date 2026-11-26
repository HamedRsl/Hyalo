import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HyMotion } from '@hyalo/angular/motion';
import { HyNumberTicker } from '@hyalo/angular/number-ticker';
import { HyStat } from '@hyalo/angular/stat';
import {
  HyActivityBlock,
  HyDashboardBlock,
  HyFeatureBlock,
  HyHeroBlock,
  HyKpiStripBlock,
  HyPricingBlock,
  HyProductBlock,
  HyTestimonialsBlock,
} from './blocks';

@Component({
  imports: [HyHeroBlock, HyDashboardBlock, HyProductBlock],
  template: `<div dir="rtl" lang="fa">
    <hy-hero-block heading="فصل تازه" actionHref="/start" actionLabel="شروع">
      <a hyBlockActions href="/learn">بیشتر بدانید</a>
      <img hyBlockMedia src="example.jpg" alt="نمای محصول" />
    </hy-hero-block>
    <hy-dashboard-block maxHeight="36rem" contentLabel="Report content">
      <nav hyBlockSidebar aria-label="Workspace"><a href="/overview">Overview</a></nav>
      <div hyBlockToolbar><button type="button">Refresh</button></div>
      <main><h2>Report</h2></main>
    </hy-dashboard-block>
    <hy-product-block heading="Edition" price="$240" actionHref="/product">
      <img hyBlockMedia src="edition.jpg" alt="Edition" />
      <select hyBlockOptions aria-label="Finish">
        <option>Silver</option>
        <option>Gold</option>
      </select>
      <p>Host-owned availability</p>
    </hy-product-block>
  </div>`,
})
class SlotsHost {}

describe('marketing and data block contracts', () => {
  it('preserves both hero CTAs in native focus order and projects media in RTL', async () => {
    const f = TestBed.createComponent(SlotsHost);
    await f.whenStable();
    const hero = f.nativeElement.querySelector('hy-hero-block') as HTMLElement;
    const links = [...hero.querySelectorAll('a')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/start', '/learn']);
    expect(links.map((a) => a.textContent?.trim())).toEqual(['شروع', 'بیشتر بدانید']);
    for (const link of links) {
      link.focus();
      expect(document.activeElement).toBe(link);
      expect(link.tabIndex).toBe(0);
    }
    expect(hero.querySelector('.stage img')?.getAttribute('alt')).toBe('نمای محصول');
    expect(hero.closest('[dir]')?.getAttribute('dir')).toBe('rtl');
  });

  it('keeps dashboard sidebar, toolbar and main content in DOM reading order', async () => {
    const f = TestBed.createComponent(SlotsHost);
    await f.whenStable();
    const shell = f.nativeElement.querySelector('hy-dashboard-block') as HTMLElement;
    expect(shell.querySelector('aside nav a')?.textContent).toBe('Overview');
    expect(shell.querySelector('header button')?.textContent).toBe('Refresh');
    expect(shell.querySelector('.main main h2')?.textContent).toBe('Report');
    expect(shell.querySelector('.main')?.getAttribute('aria-label')).toBe('Report content');
    expect(shell.querySelector<HTMLElement>('.main')?.tabIndex).toBe(0);
    expect(
      shell
        .querySelector<HTMLElement>('.shell')
        ?.style.getPropertyValue('--hy-dashboard-block-max-height'),
    ).toBe('36rem');
    expect([...shell.querySelectorAll('a,button')].map((el) => el.textContent)).toEqual([
      'Overview',
      'Refresh',
    ]);
  });

  it('preserves product options and commerce as native host-owned actions', async () => {
    const f = TestBed.createComponent(SlotsHost);
    await f.whenStable();
    const product = f.nativeElement.querySelector('hy-product-block') as HTMLElement;
    expect(product.querySelector('.media img')?.getAttribute('alt')).toBe('Edition');
    const select = product.querySelector('select')!;
    select.value = 'Gold';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(select.value).toBe('Gold');
    expect(product.querySelector('a')?.getAttribute('href')).toBe('/product');
    expect(product.textContent).toContain('Host-owned availability');
  });

  it('updates controlled billing, prices and localized accessible text without an engine', async () => {
    TestBed.inject(HyMotion).setReduced(true);
    const f = TestBed.createComponent(HyPricingBlock);
    f.componentRef.setInput('locale', 'fa-IR');
    f.componentRef.setInput('monthlyLabel', 'ماهانه');
    f.componentRef.setInput('annualLabel', 'سالانه');
    f.componentRef.setInput('plans', [
      {
        id: 'team',
        name: 'تیم',
        description: 'برای تیم',
        monthly: 24,
        annual: 240,
        features: ['دسترسی'],
        href: '/team',
      },
    ]);
    const changed = vi.fn();
    f.componentInstance.billing.subscribe(changed);
    await f.whenStable();
    const buttons = f.nativeElement.querySelectorAll('.billing button');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    buttons[1].click();
    await f.whenStable();
    expect(changed).toHaveBeenCalledWith('annual');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(f.debugElement.query(By.directive(HyNumberTicker)).componentInstance.value()).toBe(240);
    expect(f.nativeElement.querySelector('strong').textContent).toContain('۲۴۰');
    expect(f.nativeElement.querySelector('a').getAttribute('href')).toBe('/team');
    f.componentInstance.billing.set('monthly');
    await f.whenStable();
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    f.destroy();
    TestBed.inject(HyMotion).setReduced(null);
  });

  it('updates feature data by stable identity and uses non-blurring repeated cards', async () => {
    const f = TestBed.createComponent(HyFeatureBlock);
    f.componentRef.setInput('features', [{ id: 'one', title: 'Old', description: 'Before' }]);
    await f.whenStable();
    const card = f.nativeElement.querySelector('hy-card');
    f.componentRef.setInput('features', [{ id: 'one', title: 'تازه', description: 'اکنون' }]);
    await f.whenStable();
    expect(f.nativeElement.querySelector('hy-card')).toBe(card);
    expect(card.textContent).toContain('تازه');
    expect(card.getAttribute('data-material')).toBe('tinted');
    f.componentRef.setInput('features', []);
    await f.whenStable();
    expect(f.nativeElement.querySelector('hy-card')).toBeNull();
  });

  it('associates testimonial quotations with captions and removes stale entries', async () => {
    const f = TestBed.createComponent(HyTestimonialsBlock);
    f.componentRef.setInput('items', [
      { id: 'mina', quote: 'روشن و ساده', author: 'مینا', role: 'نمونه' },
    ]);
    await f.whenStable();
    const figure = f.nativeElement.querySelector('figure');
    expect(figure.querySelector('blockquote').textContent).toBe('روشن و ساده');
    expect(figure.querySelector('figcaption').textContent).toContain('مینا');
    f.componentRef.setInput('items', []);
    await f.whenStable();
    expect(f.nativeElement.querySelector('figure')).toBeNull();
  });

  it('keeps KPI values static by default and updates localized financial data', async () => {
    const f = TestBed.createComponent(HyKpiStripBlock);
    f.componentRef.setInput('locale', 'fa-IR');
    f.componentRef.setInput('items', [
      { id: 'balance', label: 'مانده', value: -12.5, suffix: ' ریال' },
    ]);
    await f.whenStable();
    const stat = f.debugElement.query(By.directive(HyStat)).componentInstance as HyStat;
    expect(stat.value()).toBe(-12.5);
    expect(f.nativeElement.textContent).toContain('۱۳');
    expect(f.nativeElement.querySelector('canvas')).toBeNull();
    f.componentRef.setInput('items', [{ id: 'balance', label: 'مانده', value: 0 }]);
    await f.whenStable();
    expect(stat.value()).toBe(0);
  });

  it('renders machine-readable activity times and removes stale audit data', async () => {
    const f = TestBed.createComponent(HyActivityBlock);
    f.componentRef.setInput('items', [
      {
        id: 'one',
        heading: 'ویرایش',
        description: 'مینا',
        time: 'امروز',
        dateTime: '2026-11-16T10:30:00Z',
      },
    ]);
    await f.whenStable();
    expect(f.nativeElement.querySelector('ol li time').getAttribute('datetime')).toBe(
      '2026-11-16T10:30:00Z',
    );
    expect(f.nativeElement.querySelector('time').textContent).toBe('امروز');
    f.componentRef.setInput('items', []);
    await f.whenStable();
    expect(f.nativeElement.querySelector('li')).toBeNull();
  });
});
