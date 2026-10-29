import { TestBed } from '@angular/core/testing';
import { provideHyalo } from '../core/config';
import { HyFidelity, detectFidelity } from './fidelity';

describe('detectFidelity', () => {
  it('drops to low for reduced motion and data saver', () => {
    expect(detectFidelity({}, true)).toBe('low');
    expect(detectFidelity({ connection: { saveData: true } }, false)).toBe('low');
  });

  it('uses memory and cores to pick a tier', () => {
    expect(detectFidelity({ deviceMemory: 2, hardwareConcurrency: 8 }, false)).toBe('low');
    expect(detectFidelity({ deviceMemory: 4, hardwareConcurrency: 8 }, false)).toBe('medium');
    expect(detectFidelity({ deviceMemory: 8, hardwareConcurrency: 8 }, false)).toBe('high');
  });
});

describe('HyFidelity', () => {
  it('respects a forced tier from config', () => {
    TestBed.configureTestingModule({ providers: [provideHyalo({ fidelity: 'low' })] });
    expect(TestBed.inject(HyFidelity).tier()).toBe('low');
  });

  it('starts at medium so server and client markup match', () => {
    expect(TestBed.inject(HyFidelity).tier()).toBe('medium');
  });

  it('mirrors the tier to the root element', async () => {
    const fidelity = TestBed.inject(HyFidelity);
    fidelity.setTier('high');
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-hy-fidelity')).toBe('high');
  });
});
