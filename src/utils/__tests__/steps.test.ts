import { steps } from '../steps';

describe('steps utility', () => {
  it('exports steps array', () => {
    expect(steps).toBeDefined();
    expect(Array.isArray(steps)).toBe(true);
  });

  it('has correct number of steps', () => {
    expect(steps.length).toBe(4);
  });

  it('has correct step IDs', () => {
    const stepIds = steps.map(step => step.id);
    expect(stepIds).toContain('select-assets');
    expect(stepIds).toContain('replacement-purchases');
    expect(stepIds).toContain('results-tax');
    expect(stepIds).toContain('actions');
  });

  it('has correct step labels', () => {
    const stepLabels = steps.map(step => step.label);
    expect(stepLabels).toContain('Select Assets');
    expect(stepLabels).toContain('Add Replacement Purchases');
    expect(stepLabels).toContain('Results & Tax');
    expect(stepLabels).toContain('Actions');
  });

  it('each step has id and label', () => {
    steps.forEach(step => {
      expect(step).toHaveProperty('id');
      expect(step).toHaveProperty('label');
      expect(typeof step.id).toBe('string');
      expect(typeof step.label).toBe('string');
    });
  });
});

