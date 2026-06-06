import { describe, it, expect } from 'vitest';
import { newActivity, regionFor, missingDims, summarize } from './ikigai';

function make(dims = {}) {
    return { ...newActivity('Test'), ...dims };
}

describe('newActivity', () => {
    it('starts with an empty note and all dimensions false', () => {
        const a = newActivity('  Painting  ');
        expect(a.name).toBe('Painting');
        expect(a.note).toBe('');
        expect([a.love, a.skill, a.need, a.pay]).toEqual([false, false, false, false]);
        expect(a.id).toBeTruthy();
    });
});

describe('regionFor', () => {
    it('classifies all four as ikigai', () => {
        expect(regionFor(make({ love: true, skill: true, need: true, pay: true })).tier).toBe('ikigai');
    });

    it('names the four classic overlaps', () => {
        expect(regionFor(make({ love: true, skill: true })).id).toBe('passion');
        expect(regionFor(make({ love: true, need: true })).id).toBe('mission');
        expect(regionFor(make({ skill: true, pay: true })).id).toBe('profession');
        expect(regionFor(make({ need: true, pay: true })).id).toBe('vocation');
    });

    it('treats non-adjacent pairs as a generic pair', () => {
        expect(regionFor(make({ love: true, pay: true })).id).toBe('pair');
        expect(regionFor(make({ skill: true, need: true })).id).toBe('pair');
    });

    it('marks three-of-four as almost, naming the missing dimension', () => {
        const r = regionFor(make({ love: true, skill: true, need: true }));
        expect(r.tier).toBe('almost');
        expect(r.missing.key).toBe('pay');
    });

    it('handles single and none', () => {
        expect(regionFor(make({ love: true })).tier).toBe('single');
        expect(regionFor(make()).tier).toBe('none');
    });
});

describe('missingDims', () => {
    it('returns the dimensions not yet active', () => {
        const keys = missingDims(make({ love: true, pay: true })).map((d) => d.key);
        expect(keys).toEqual(['skill', 'need']);
    });
});

describe('summarize', () => {
    it('buckets activities by tier', () => {
        const groups = summarize([
            make({ love: true, skill: true, need: true, pay: true }),
            make({ love: true, skill: true, need: true }),
            make({ love: true, skill: true }),
            make({ love: true }),
            make()
        ]);
        expect(groups.ikigai).toHaveLength(1);
        expect(groups.almost).toHaveLength(1);
        expect(groups.overlap).toHaveLength(1);
        expect(groups.single).toHaveLength(1);
        expect(groups.none).toHaveLength(1);
    });
});
