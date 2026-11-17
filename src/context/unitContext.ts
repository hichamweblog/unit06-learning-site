import { createContext } from 'react';
import type { Unit } from '../data/units/normalize';

export const UnitContext = createContext<Unit | null>(null);
