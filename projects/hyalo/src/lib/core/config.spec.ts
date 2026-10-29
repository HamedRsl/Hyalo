import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_CONFIG, provideHyalo } from './config';

@Component({ template: '', providers: [provideHyalo({ material: 'solid' })] })
class Scoped {
  readonly config = inject(HY_CONFIG);
}

describe('provideHyalo', () => {
  it('has sensible defaults', () => {
    expect(TestBed.inject(HY_CONFIG)).toMatchObject({
      material: 'frosted',
      size: 'md',
      tone: 'accent',
    });
  });

  it('merges a component-level config over the parent one', () => {
    TestBed.configureTestingModule({ providers: [provideHyalo({ size: 'lg' })] });
    const { config } = TestBed.createComponent(Scoped).componentInstance;
    expect(config.material).toBe('solid');
    expect(config.size).toBe('lg');
  });
});
